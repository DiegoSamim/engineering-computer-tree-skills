import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import type { Db } from '../db.ts';

interface Migration {
  version: number;
  name: string;
  sql: string;
}

function loadMigrations(): Migration[] {
  const dir = import.meta.dirname;
  return readdirSync(dir)
    .filter((f) => f.endsWith('.sql'))
    .map((file) => {
      const version = Number.parseInt(file.slice(0, 3), 10);
      if (Number.isNaN(version)) {
        throw new Error(`Migration com nome inválido: ${file} (esperado 001_nome.sql)`);
      }
      return { version, name: file, sql: readFileSync(join(dir, file), 'utf8') };
    })
    .sort((a, b) => a.version - b.version);
}

/**
 * Aplica em ordem as migrations ainda não registradas. Idempotente: rodar de
 * novo não faz nada. Cada migration roda na sua própria transação, então uma
 * falha no meio não deixa o schema parcialmente aplicado.
 */
export function migrate(db: Db): { applied: number[]; current: number } {
  db.exec('CREATE TABLE IF NOT EXISTS schema_migrations (version INTEGER PRIMARY KEY, applied_at TEXT NOT NULL)');

  const done = new Set(
    (db.prepare('SELECT version FROM schema_migrations').all() as { version: number }[]).map((r) => r.version),
  );

  const applied: number[] = [];
  for (const migration of loadMigrations()) {
    if (done.has(migration.version)) continue;

    db.exec('BEGIN');
    try {
      db.exec(migration.sql);
      db.prepare('INSERT INTO schema_migrations (version, applied_at) VALUES (?, ?)').run(
        migration.version,
        new Date().toISOString(),
      );
      db.exec('COMMIT');
      applied.push(migration.version);
    } catch (error) {
      db.exec('ROLLBACK');
      throw new Error(`Falha na migration ${migration.name}: ${(error as Error).message}`);
    }
  }

  const current = db.prepare('SELECT COALESCE(MAX(version), 0) AS v FROM schema_migrations').get() as { v: number };
  return { applied, current: current.v };
}
