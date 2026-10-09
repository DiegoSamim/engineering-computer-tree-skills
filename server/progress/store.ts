import type { ExportPayload, StoredEvent } from '../../src/domain/tree/api.ts';
import { isGuideId } from '../../src/domain/tree/guides.ts';
import { levelFromCriteria } from '../../src/domain/tree/levels.ts';
import type { EventType, ProgressEventInput } from '../../src/domain/tree/types.ts';
import { xpFor } from '../../src/domain/tree/xp.ts';
import { transaction, type Db } from '../db.ts';
import { HttpError } from '../http.ts';

/** Single-user local: todo progresso é do usuário 1 (semeado na migration). */
const USER = 1;

interface NodeRow {
  id: number;
  slug: string;
  max_level: number;
}

/** Evento com os ids do banco já resolvidos. */
type Resolved =
  | { type: 'iniciou'; node: NodeRow }
  | { type: 'criterio_marcado' | 'criterio_desmarcado'; node: NodeRow; criterionId: number }
  | { type: 'guia_lida' | 'guia_desmarcada'; node: NodeRow; guide: string }
  | { type: 'exercicio_tentado' | 'exercicio_resolvido'; node: NodeRow; exerciseId: number }
  | { type: 'sessao_estudo'; node: NodeRow; seconds: number };

/**
 * Persistência do progresso.
 *
 * `progress_event` é a fonte da verdade (só INSERT); `user_node`,
 * `user_criterion`, `user_guide` e `user_exercise` são estado materializado e
 * podem ser refeitos com `rebuild()`. O nível vem de `levelFromCriteria`, a
 * mesma função do domínio que o navegador usa: o servidor não reimplementa
 * regra.
 */
export class ProgressStore {
  private readonly db: Db;

  constructor(db: Db) {
    this.db = db;
  }

  /**
   * Grava o evento e atualiza o estado. Devolve `false` sem gravar nada
   * quando o evento não muda nada (marcar o que já está marcado), para o log
   * e o XP não inflarem. Erro de referência (nó, critério...) é 400.
   */
  append(input: ProgressEventInput, occurredAt = new Date().toISOString()): boolean {
    return transaction(this.db, () => this.record(input, occurredAt));
  }

  eventCount(): number {
    return (this.db.prepare('SELECT COUNT(*) AS n FROM progress_event WHERE user_id = ?').get(USER) as { n: number }).n;
  }

  setDisplayName(displayName: string): void {
    this.db.prepare('UPDATE app_user SET display_name = ? WHERE id = ?').run(displayName, USER);
  }

  // ── Log completo ───────────────────────────────────────────────────────────

  exportLog(): ExportPayload {
    return { version: 1, events: this.storedEvents() };
  }

  /**
   * Substitui o log e remonta o estado, preservando `occurredAt`. Eventos que
   * não fazem mais sentido no catálogo atual são descartados e contados.
   */
  importLog(payload: ExportPayload): { imported: number; skipped: number } {
    return transaction(this.db, () => {
      this.clear(true);
      let imported = 0;
      let skipped = 0;
      for (const { occurredAt, ...input } of payload.events) {
        try {
          if (this.record(input as ProgressEventInput, occurredAt)) imported++;
          else skipped++;
        } catch (error) {
          if (!(error instanceof HttpError)) throw error;
          skipped++;
        }
      }
      return { imported, skipped };
    });
  }

  /**
   * Refaz o estado materializado a partir do log. Roda no boot, depois do
   * seed: se critérios mudaram no conteúdo, os níveis acompanham.
   */
  rebuild(): void {
    transaction(this.db, () => {
      this.clear(false);
      for (const event of this.storedEvents()) {
        const { occurredAt, ...input } = event;
        try {
          const resolved = this.resolve(input as ProgressEventInput);
          if (this.changes(resolved)) this.apply(resolved, occurredAt);
        } catch (error) {
          // Referência que saiu do catálogo (ex.: critério removido): o fato
          // continua no log, só não produz estado.
          if (!(error instanceof HttpError)) throw error;
        }
      }
    });
  }

  reset(): void {
    transaction(this.db, () => this.clear(true));
  }

  // ── Interno ──────────────────────────────────────────────────────────────

  private record(input: ProgressEventInput, occurredAt: string): boolean {
    const resolved = this.resolve(input);
    if (!this.changes(resolved)) return false;

    const { type, node: _node, ...payload } = input;
    this.db
      .prepare('INSERT INTO progress_event (user_id, node_id, type, payload, xp, occurred_at) VALUES (?, ?, ?, ?, ?, ?)')
      .run(
        USER,
        resolved.node.id,
        type,
        Object.keys(payload).length ? JSON.stringify(payload) : null,
        xpFor(type),
        occurredAt,
      );
    this.apply(resolved, occurredAt);
    return true;
  }

  private storedEvents(): StoredEvent[] {
    const rows = this.db
      .prepare(
        `SELECT e.type, n.slug, e.payload, e.occurred_at FROM progress_event e
         JOIN node n ON n.id = e.node_id WHERE e.user_id = ? ORDER BY e.id`,
      )
      .all(USER) as { type: EventType; slug: string; payload: string | null; occurred_at: string }[];
    return rows.map(
      (r) => ({ type: r.type, node: r.slug, ...(r.payload ? JSON.parse(r.payload) : {}), occurredAt: r.occurred_at }) as StoredEvent,
    );
  }

  private resolve(input: ProgressEventInput): Resolved {
    const node = this.db.prepare('SELECT id, slug, max_level FROM node WHERE slug = ?').get(input.node) as NodeRow | undefined;
    if (!node) throw new HttpError(400, `Nó desconhecido: ${input.node}`);

    switch (input.type) {
      case 'iniciou':
        return { type: input.type, node };
      case 'criterio_marcado':
      case 'criterio_desmarcado': {
        const row = this.db
          .prepare('SELECT id FROM node_criterion WHERE node_id = ? AND slug = ?')
          .get(node.id, input.criterion) as { id: number } | undefined;
        if (!row) throw new HttpError(400, `Critério desconhecido em ${node.slug}: ${input.criterion}`);
        return { type: input.type, node, criterionId: row.id };
      }
      case 'guia_lida':
      case 'guia_desmarcada':
        if (!isGuideId(input.guide)) throw new HttpError(400, `Guia desconhecida: ${input.guide}`);
        return { type: input.type, node, guide: input.guide };
      case 'exercicio_tentado':
      case 'exercicio_resolvido': {
        const row = this.db
          .prepare('SELECT id FROM exercise WHERE node_id = ? AND slug = ?')
          .get(node.id, input.exercise) as { id: number } | undefined;
        if (!row) throw new HttpError(400, `Exercício desconhecido em ${node.slug}: ${input.exercise}`);
        return { type: input.type, node, exerciseId: row.id };
      }
      case 'sessao_estudo':
        return { type: input.type, node, seconds: input.seconds };
    }
  }

  /** O evento muda o estado? Os que não mudam não entram no log. */
  private changes(r: Resolved): boolean {
    const exists = (sql: string, ...params: (number | string)[]) => this.db.prepare(sql).get(...params) !== undefined;
    switch (r.type) {
      case 'iniciou':
        return !exists('SELECT 1 FROM user_node WHERE user_id = ? AND node_id = ? AND started_at IS NOT NULL', USER, r.node.id);
      case 'criterio_marcado':
      case 'criterio_desmarcado': {
        const checked = exists('SELECT 1 FROM user_criterion WHERE user_id = ? AND criterion_id = ?', USER, r.criterionId);
        return r.type === 'criterio_marcado' ? !checked : checked;
      }
      case 'guia_lida':
      case 'guia_desmarcada': {
        const read = exists('SELECT 1 FROM user_guide WHERE user_id = ? AND node_id = ? AND guide_id = ?', USER, r.node.id, r.guide);
        return r.type === 'guia_lida' ? !read : read;
      }
      case 'exercicio_resolvido':
        return !exists(
          'SELECT 1 FROM user_exercise WHERE user_id = ? AND exercise_id = ? AND solved_at IS NOT NULL',
          USER,
          r.exerciseId,
        );
      case 'exercicio_tentado':
      case 'sessao_estudo':
        return true;
    }
  }

  private apply(r: Resolved, at: string): void {
    const db = this.db;
    // Qualquer atividade num nó conta como "iniciou".
    db.prepare('INSERT INTO user_node (user_id, node_id) VALUES (?, ?) ON CONFLICT DO NOTHING').run(USER, r.node.id);
    db.prepare('UPDATE user_node SET started_at = COALESCE(started_at, ?) WHERE user_id = ? AND node_id = ?').run(at, USER, r.node.id);

    switch (r.type) {
      case 'iniciou':
        break;
      case 'criterio_marcado':
        db.prepare('INSERT INTO user_criterion (user_id, criterion_id, checked_at) VALUES (?, ?, ?)').run(USER, r.criterionId, at);
        this.recomputeLevel(r.node, at);
        break;
      case 'criterio_desmarcado':
        db.prepare('DELETE FROM user_criterion WHERE user_id = ? AND criterion_id = ?').run(USER, r.criterionId);
        this.recomputeLevel(r.node, at);
        break;
      case 'guia_lida':
        db.prepare('INSERT INTO user_guide (user_id, node_id, guide_id, read_at) VALUES (?, ?, ?, ?)').run(USER, r.node.id, r.guide, at);
        break;
      case 'guia_desmarcada':
        db.prepare('DELETE FROM user_guide WHERE user_id = ? AND node_id = ? AND guide_id = ?').run(USER, r.node.id, r.guide);
        break;
      case 'exercicio_tentado':
      case 'exercicio_resolvido':
        db.prepare(
          `INSERT INTO user_exercise (user_id, exercise_id, attempts, solved_at) VALUES (?, ?, 1, ?)
           ON CONFLICT(user_id, exercise_id) DO UPDATE SET attempts = attempts + 1,
             solved_at = COALESCE(user_exercise.solved_at, excluded.solved_at)`,
        ).run(USER, r.exerciseId, r.type === 'exercicio_resolvido' ? at : null);
        break;
      case 'sessao_estudo':
        db.prepare('UPDATE user_node SET seconds_studied = seconds_studied + ? WHERE user_id = ? AND node_id = ?').run(
          r.seconds,
          USER,
          r.node.id,
        );
        break;
    }
  }

  private recomputeLevel(node: NodeRow, at: string): void {
    const criteria = this.db
      .prepare('SELECT slug AS id, level FROM node_criterion WHERE node_id = ?')
      .all(node.id) as { id: string; level: number }[];
    const checked = (
      this.db
        .prepare(
          `SELECT c.slug FROM user_criterion uc JOIN node_criterion c ON c.id = uc.criterion_id
           WHERE uc.user_id = ? AND c.node_id = ?`,
        )
        .all(USER, node.id) as { slug: string }[]
    ).map((r) => r.slug);

    const level = levelFromCriteria(criteria, checked, node.max_level);
    this.db
      .prepare(
        `UPDATE user_node SET level = ?,
           completed_at = CASE WHEN ? >= ? THEN COALESCE(completed_at, ?) ELSE NULL END
         WHERE user_id = ? AND node_id = ?`,
      )
      .run(level, level, node.max_level, at, USER, node.id);
  }

  private clear(withLog: boolean): void {
    for (const table of ['user_criterion', 'user_guide', 'user_exercise', 'user_node']) {
      this.db.prepare(`DELETE FROM ${table} WHERE user_id = ?`).run(USER);
    }
    if (withLog) this.db.prepare('DELETE FROM progress_event WHERE user_id = ?').run(USER);
  }
}
