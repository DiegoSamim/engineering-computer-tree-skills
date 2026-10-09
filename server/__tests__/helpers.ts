import type { Catalog } from '../../src/domain/tree/types.ts';
import { seedCatalog } from '../catalog/seed.ts';
import { openDatabase, type Db } from '../db.ts';
import { migrate } from '../migrations/run.ts';

/** Banco em memória, migrado e semeado: o mesmo caminho do boot. */
export function freshDb(catalog?: Catalog): Db {
  const db = openDatabase(':memory:');
  migrate(db);
  if (catalog) seedCatalog(db, catalog);
  return db;
}

export function nodeId(db: Db, slug: string): number {
  return (db.prepare('SELECT id FROM node WHERE slug = ?').get(slug) as { id: number }).id;
}

/** O `set_level` de docs/db/test_schema.py: grava o nível direto e um evento de XP. */
export function setLevelDirect(db: Db, slug: string, level: number, xp: number): void {
  const id = nodeId(db, slug);
  db.prepare(
    `INSERT INTO user_node (user_id, node_id, level, started_at) VALUES (1, ?, ?, datetime('now'))
     ON CONFLICT(user_id, node_id) DO UPDATE SET level = excluded.level`,
  ).run(id, level);
  db.prepare("INSERT INTO progress_event (user_id, node_id, type, xp) VALUES (1, ?, 'criterio_marcado', ?)").run(id, xp);
}
