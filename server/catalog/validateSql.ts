import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import type { Db } from '../db.ts';

export interface SqlCatalogError {
  code: string;
  detail: string;
}

const STATEMENTS = readFileSync(join(import.meta.dirname, 'validate.sql'), 'utf8')
  .replace(/--[^\n]*/g, '')
  .split(';')
  .map((s) => s.trim())
  .filter((s) => s.length > 0);

/**
 * Roda as checagens de validate.sql no banco semeado. Cada linha devolvida é
 * um erro: a primeira coluna é o código, a segunda o detalhe. Os mesmos
 * códigos de validateCatalog() em src/domain/tree/validate.ts.
 */
export function validateCatalogSql(db: Db): SqlCatalogError[] {
  return STATEMENTS.flatMap((sql) =>
    (db.prepare(sql).all() as Record<string, unknown>[]).map((row) => {
      const [code, detail] = Object.values(row);
      return { code: String(code), detail: String(detail) };
    }),
  );
}
