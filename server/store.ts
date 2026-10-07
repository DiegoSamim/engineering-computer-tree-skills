import { applyProgressEvent, replayEvents } from '../src/data/reducer.ts';
import {
  createEmptySnapshot,
  createEmptyTopicProgress,
  MASTERY_DIMENSIONS,
  SCHEMA_VERSION,
  type MasteryDimension,
  type ProgressEvent,
  type ProgressSnapshot,
  type StoredEvent,
  type TopicProgress,
  type TopicStatus,
} from '../src/data/types.ts';
import { bit, transaction, type Db } from './db.ts';

export interface ExportPayload {
  schemaVersion: number;
  events: StoredEvent[];
}

/** Erro de domínio — o roteador o traduz para 400 em vez de 500. */
export class UnknownTopicError extends Error {
  readonly topicId: string;

  constructor(topicId: string) {
    super(`Tópico desconhecido no catálogo: ${topicId}`);
    this.name = 'UnknownTopicError';
    this.topicId = topicId;
  }
}

/**
 * Persistência do progresso em SQLite.
 *
 * A regra central: este store NÃO reimplementa as regras de progresso. Ele
 * grava o fato no log e chama `applyProgressEvent` — exatamente a mesma função
 * que o navegador usa — para derivar o novo estado. Duas implementações das
 * mesmas regras divergiriam com o tempo; uma não pode.
 */
export class SqliteProgressStore {
  private readonly db: Db;

  constructor(db: Db) {
    this.db = db;
  }

  // ── Leitura ────────────────────────────────────────────────────────────────

  load(): ProgressSnapshot {
    const snapshot = createEmptySnapshot(this.lastEventAt() ?? new Date(0).toISOString());

    const profile = this.db.prepare('SELECT display_name FROM profile WHERE id = 1').get() as
      | { display_name: string }
      | undefined;
    if (profile) snapshot.profile = { displayName: profile.display_name };

    const topicOf = (id: string): TopicProgress => {
      snapshot.topics[id] ??= createEmptyTopicProgress();
      return snapshot.topics[id];
    };

    for (const row of this.db
      .prepare('SELECT topic_id, status, started_at, completed_at, seconds_studied FROM topic_progress')
      .all() as {
      topic_id: string;
      status: TopicStatus;
      started_at: string | null;
      completed_at: string | null;
      seconds_studied: number;
    }[]) {
      const topic = topicOf(row.topic_id);
      topic.status = row.status;
      topic.secondsStudied = row.seconds_studied;
      if (row.started_at) topic.startedAt = row.started_at;
      if (row.completed_at) topic.completedAt = row.completed_at;
    }

    for (const row of this.db
      .prepare('SELECT topic_id, section_key FROM topic_section_progress ORDER BY completed_at')
      .all() as { topic_id: string; section_key: string }[]) {
      topicOf(row.topic_id).sectionsDone.push(row.section_key);
    }

    for (const row of this.db
      .prepare('SELECT topic_id, dimension, checked FROM mastery_check')
      .all() as { topic_id: string; dimension: MasteryDimension; checked: number }[]) {
      topicOf(row.topic_id).mastery[row.dimension] = row.checked === 1;
    }

    for (const row of this.db
      .prepare('SELECT topic_id, exercise_id FROM exercise_progress WHERE done = 1')
      .all() as { topic_id: string; exercise_id: string }[]) {
      topicOf(row.topic_id).exercisesDone.push(row.exercise_id);
    }

    return snapshot;
  }

  eventCount(): number {
    return (this.db.prepare('SELECT COUNT(*) AS n FROM progress_event').get() as { n: number }).n;
  }

  private lastEventAt(): string | null {
    const row = this.db.prepare('SELECT MAX(occurred_at) AS t FROM progress_event').get() as { t: string | null };
    return row.t;
  }

  private topicExists(topicId: string): boolean {
    return this.db.prepare('SELECT 1 FROM topic WHERE id = ?').get(topicId) !== undefined;
  }

  // ── Escrita ────────────────────────────────────────────────────────────────

  append(event: ProgressEvent, occurredAt = new Date().toISOString()): ProgressSnapshot {
    if (event.type !== 'PROFILE_SET' && !this.topicExists(event.topicId)) {
      throw new UnknownTopicError(event.topicId);
    }

    return transaction(this.db, () => {
      this.insertEvent(event, occurredAt);
      const next = applyProgressEvent(this.load(), event, occurredAt);
      this.writeDerived(next, event, occurredAt);
      return next;
    });
  }

  private insertEvent(event: ProgressEvent, occurredAt: string): void {
    this.db
      .prepare('INSERT INTO progress_event (occurred_at, type, topic_id, payload) VALUES (?, ?, ?, ?)')
      .run(occurredAt, event.type, event.type === 'PROFILE_SET' ? null : event.topicId, JSON.stringify(event));
  }

  /** Materializa apenas o que o evento tocou — perfil, ou um único tópico. */
  private writeDerived(snapshot: ProgressSnapshot, event: ProgressEvent, now: string): void {
    if (event.type === 'PROFILE_SET') {
      this.db
        .prepare(
          `INSERT INTO profile (id, display_name, created_at, updated_at) VALUES (1, ?, ?, ?)
           ON CONFLICT(id) DO UPDATE SET display_name = excluded.display_name, updated_at = excluded.updated_at`,
        )
        .run(snapshot.profile?.displayName ?? '', now, now);
      return;
    }

    this.writeTopic(event.topicId, snapshot.topics[event.topicId], now);
  }

  private writeTopic(topicId: string, topic: TopicProgress | undefined, now: string): void {
    if (!topic) return;

    this.db
      .prepare(
        `INSERT INTO topic_progress (topic_id, status, started_at, completed_at, updated_at, seconds_studied)
         VALUES (?, ?, ?, ?, ?, ?)
         ON CONFLICT(topic_id) DO UPDATE SET
           status = excluded.status, started_at = excluded.started_at,
           completed_at = excluded.completed_at, updated_at = excluded.updated_at,
           seconds_studied = excluded.seconds_studied`,
      )
      .run(topicId, topic.status, topic.startedAt ?? null, topic.completedAt ?? null, now, topic.secondsStudied);

    // Listas pequenas e delimitadas: reescrever é mais simples — e mais fácil
    // de auditar — do que calcular o diff.
    this.db.prepare('DELETE FROM topic_section_progress WHERE topic_id = ?').run(topicId);
    const insertSection = this.db.prepare(
      'INSERT INTO topic_section_progress (topic_id, section_key, completed_at) VALUES (?, ?, ?)',
    );
    for (const key of topic.sectionsDone) insertSection.run(topicId, key, now);

    const upsertMastery = this.db.prepare(
      `INSERT INTO mastery_check (topic_id, dimension, checked, updated_at) VALUES (?, ?, ?, ?)
       ON CONFLICT(topic_id, dimension) DO UPDATE SET checked = excluded.checked, updated_at = excluded.updated_at`,
    );
    for (const dimension of MASTERY_DIMENSIONS) {
      if (topic.mastery[dimension] === undefined) continue;
      upsertMastery.run(topicId, dimension, bit(topic.mastery[dimension]), now);
    }

    this.db.prepare('DELETE FROM exercise_progress WHERE topic_id = ?').run(topicId);
    const insertExercise = this.db.prepare(
      'INSERT INTO exercise_progress (topic_id, exercise_id, done, attempts, last_attempt_at) VALUES (?, ?, 1, 1, ?)',
    );
    for (const id of topic.exercisesDone) insertExercise.run(topicId, id, now);
  }

  // ── Log completo ───────────────────────────────────────────────────────────

  exportLog(): ExportPayload {
    const rows = this.db
      .prepare('SELECT occurred_at, payload FROM progress_event ORDER BY id')
      .all() as { occurred_at: string; payload: string }[];

    return {
      schemaVersion: SCHEMA_VERSION,
      events: rows.map((r) => ({ ...(JSON.parse(r.payload) as ProgressEvent), occurredAt: r.occurred_at })),
    };
  }

  /**
   * Substitui o log inteiro e remonta o estado. É o caminho de migração do
   * localStorage para cá — por isso preserva `occurredAt` de cada evento, em
   * vez de carimbar tudo com a data de agora.
   */
  importLog(payload: ExportPayload): { snapshot: ProgressSnapshot; imported: number; skipped: number } {
    return transaction(this.db, () => {
      this.clearAll();

      let skipped = 0;
      const accepted: StoredEvent[] = [];
      const insert = this.db.prepare(
        'INSERT INTO progress_event (occurred_at, type, topic_id, payload) VALUES (?, ?, ?, ?)',
      );

      for (const event of payload.events ?? []) {
        if (event.type !== 'PROFILE_SET' && !this.topicExists(event.topicId)) {
          // Evento de um tópico que não existe mais no catálogo: ignorar é
          // melhor que abortar a migração inteira por um id obsoleto.
          skipped++;
          continue;
        }
        const { occurredAt, ...fact } = event;
        insert.run(occurredAt, event.type, event.type === 'PROFILE_SET' ? null : event.topicId, JSON.stringify(fact));
        accepted.push(event);
      }

      const snapshot = replayEvents(accepted, createEmptySnapshot());
      this.materialize(snapshot);
      return { snapshot, imported: accepted.length, skipped };
    });
  }

  /**
   * Reconstrói as tabelas derivadas a partir do log. Caminho de recuperação:
   * se a materialização tiver bug, corrige-se reprocessando, sem perder nada.
   */
  rebuild(): ProgressSnapshot {
    return transaction(this.db, () => {
      const snapshot = replayEvents(this.exportLog().events, createEmptySnapshot());
      this.clearDerived();
      this.materialize(snapshot);
      return snapshot;
    });
  }

  reset(): ProgressSnapshot {
    return transaction(this.db, () => {
      this.clearAll();
      return createEmptySnapshot();
    });
  }

  private materialize(snapshot: ProgressSnapshot): void {
    const now = snapshot.updatedAt;
    if (snapshot.profile) {
      this.db
        .prepare('INSERT INTO profile (id, display_name, created_at, updated_at) VALUES (1, ?, ?, ?)')
        .run(snapshot.profile.displayName, now, now);
    }
    for (const [topicId, topic] of Object.entries(snapshot.topics)) {
      this.writeTopic(topicId, topic, now);
    }
  }

  private clearDerived(): void {
    for (const table of ['exercise_progress', 'mastery_check', 'topic_section_progress', 'topic_progress', 'profile']) {
      this.db.exec(`DELETE FROM ${table}`);
    }
  }

  private clearAll(): void {
    this.clearDerived();
    this.db.exec('DELETE FROM progress_event');
  }
}
