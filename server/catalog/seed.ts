import type { Catalog } from '../../src/domain/tree/types.ts';
import { transaction, type Db } from '../db.ts';

/** Nó removido do conteúdo, mas com progresso gravado. */
export class SlugRemovidoError extends Error {
  readonly slugs: string[];

  constructor(slugs: string[]) {
    super(
      `Nós removidos do conteúdo ainda têm progresso: ${slugs.join(', ')}. ` +
        'Slugs são permanentes: devolva o nó ao conteúdo (pode ser como planejado).',
    );
    this.name = 'SlugRemovidoError';
    this.slugs = slugs;
  }
}

export interface SeedResult {
  areas: number;
  branches: number;
  nodes: number;
  removed: string[];
}

type Id = { id: number };

/**
 * Espelha o catálogo (src/generated/catalog.json) no banco. Idempotente:
 * roda a cada boot e converge, sem trocar ids. Critérios e exercícios são
 * atualizados por (nó, slug), porque o progresso aponta para eles; placements,
 * requisitos e relações não têm progresso e são simplesmente regravados.
 */
export function seedCatalog(db: Db, catalog: Catalog): SeedResult {
  return transaction(db, () => {
    const areaId = new Map<string, number>();
    const upsertArea = db.prepare(`
      INSERT INTO area (slug, name, sub, description, color, icon, position) VALUES (?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(slug) DO UPDATE SET name = excluded.name, sub = excluded.sub, description = excluded.description,
        color = excluded.color, icon = excluded.icon, position = excluded.position
      RETURNING id`);
    for (const a of catalog.areas) {
      const row = upsertArea.get(a.slug, a.name, a.sub ?? null, a.description ?? null, a.color, a.icon, a.position) as Id;
      areaId.set(a.slug, row.id);
    }

    const branchId = new Map<string, number>();
    const upsertBranch = db.prepare(`
      INSERT INTO branch (area_id, slug, name, description, position) VALUES (?, ?, ?, ?, ?)
      ON CONFLICT(area_id, slug) DO UPDATE SET name = excluded.name, description = excluded.description,
        position = excluded.position
      RETURNING id`);
    for (const b of catalog.branches) {
      const row = upsertBranch.get(areaId.get(b.area)!, b.slug, b.name, b.description ?? null, b.position) as Id;
      branchId.set(b.key, row.id);
    }

    // Todos os nós antes dos requisitos: um requisito pode apontar para um nó
    // que vem depois na lista.
    const nodeId = new Map<string, number>();
    const upsertNode = db.prepare(`
      INSERT INTO node (slug, home_branch_id, title, summary, kind, content_status, content_path, max_level, est_minutes, visualizer)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(slug) DO UPDATE SET home_branch_id = excluded.home_branch_id, title = excluded.title,
        summary = excluded.summary, kind = excluded.kind, content_status = excluded.content_status,
        content_path = excluded.content_path, max_level = excluded.max_level,
        est_minutes = excluded.est_minutes, visualizer = excluded.visualizer
      RETURNING id`);
    for (const n of catalog.nodes) {
      const row = upsertNode.get(
        n.slug,
        branchId.get(n.home)!,
        n.title,
        n.summary ?? null,
        n.kind,
        n.content,
        n.contentPath ?? null,
        n.maxLevel,
        n.estMinutes ?? null,
        n.visualizer ?? null,
      ) as Id;
      nodeId.set(n.slug, row.id);
    }

    const insertPlacement = db.prepare('INSERT INTO node_placement (branch_id, node_id, role, x, y) VALUES (?, ?, ?, ?, ?)');
    const insertRequirement = db.prepare(
      'INSERT INTO requirement (node_id, req_node_id, req_branch_id, min_level, strength, alt_group) VALUES (?, ?, ?, ?, ?, ?)',
    );
    const insertRelation = db.prepare('INSERT INTO node_relation (a_id, b_id, type) VALUES (?, ?, ?)');
    const upsertCriterion = db.prepare(`
      INSERT INTO node_criterion (node_id, slug, level, label, description, position) VALUES (?, ?, ?, ?, ?, ?)
      ON CONFLICT(node_id, slug) DO UPDATE SET level = excluded.level, label = excluded.label,
        description = excluded.description, position = excluded.position`);
    const upsertExercise = db.prepare(`
      INSERT INTO exercise (node_id, slug, title, url, difficulty, position) VALUES (?, ?, ?, ?, ?, ?)
      ON CONFLICT(node_id, slug) DO UPDATE SET title = excluded.title, url = excluded.url,
        difficulty = excluded.difficulty, position = excluded.position`);

    for (const n of catalog.nodes) {
      const id = nodeId.get(n.slug)!;

      db.prepare('DELETE FROM node_placement WHERE node_id = ?').run(id);
      for (const p of n.placements) insertPlacement.run(branchId.get(p.branch)!, id, p.role, p.x, p.y);

      db.prepare('DELETE FROM requirement WHERE node_id = ?').run(id);
      for (const r of n.requires) {
        insertRequirement.run(
          id,
          r.node !== undefined ? nodeId.get(r.node)! : null,
          r.branch !== undefined ? branchId.get(r.branch)! : null,
          r.minLevel,
          r.strength,
          r.group ?? null,
        );
      }

      db.prepare('DELETE FROM node_relation WHERE a_id = ?').run(id);
      for (const rel of n.related) insertRelation.run(id, nodeId.get(rel.node)!, rel.type);

      n.criteria.forEach((c, i) => upsertCriterion.run(id, c.id, c.level, c.label, c.text, i));
      deleteMissing(db, 'node_criterion', id, n.criteria.map((c) => c.id));

      n.exercises.forEach((e, i) => upsertExercise.run(id, e.id, e.title, e.url ?? null, e.difficulty ?? null, i));
      deleteMissing(db, 'exercise', id, n.exercises.map((e) => e.id));
    }

    const removed = removeObsolete(db, catalog);
    return { areas: catalog.areas.length, branches: catalog.branches.length, nodes: catalog.nodes.length, removed };
  });
}

function deleteMissing(db: Db, table: 'node_criterion' | 'exercise', nodeId: number, keep: string[]): void {
  const placeholders = keep.map(() => '?').join(', ');
  db.prepare(`DELETE FROM ${table} WHERE node_id = ?${keep.length ? ` AND slug NOT IN (${placeholders})` : ''}`).run(
    nodeId,
    ...keep,
  );
}

/** Remove do banco o que saiu do conteúdo; nunca um nó com progresso. */
function removeObsolete(db: Db, catalog: Catalog): string[] {
  const slugs = new Set(catalog.nodes.map((n) => n.slug));
  const obsolete = (db.prepare('SELECT id, slug FROM node').all() as { id: number; slug: string }[]).filter(
    (n) => !slugs.has(n.slug),
  );

  const withProgress = obsolete.filter(
    (n) =>
      db.prepare('SELECT 1 FROM progress_event WHERE node_id = ? UNION SELECT 1 FROM user_node WHERE node_id = ?').get(n.id, n.id) !==
      undefined,
  );
  if (withProgress.length > 0) throw new SlugRemovidoError(withProgress.map((n) => n.slug));

  for (const n of obsolete) db.prepare('DELETE FROM node WHERE id = ?').run(n.id);

  const branchKeys = new Set(catalog.branches.map((b) => b.key));
  const branches = db
    .prepare("SELECT b.id, a.slug || '/' || b.slug AS key FROM branch b JOIN area a ON a.id = b.area_id")
    .all() as { id: number; key: string }[];
  for (const b of branches) if (!branchKeys.has(b.key)) db.prepare('DELETE FROM branch WHERE id = ?').run(b.id);

  const areaSlugs = new Set(catalog.areas.map((a) => a.slug));
  for (const a of db.prepare('SELECT id, slug FROM area').all() as { id: number; slug: string }[]) {
    if (!areaSlugs.has(a.slug)) db.prepare('DELETE FROM area WHERE id = ?').run(a.id);
  }

  return obsolete.map((n) => n.slug);
}
