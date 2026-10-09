import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import type { Catalog } from '../../src/domain/tree/types.ts';

export const GENERATED_CATALOG = join(import.meta.dirname, '../../src/generated/catalog.json');

/** Lê o catálogo gerado por `npm run catalog`. O servidor não lê YAML. */
export function loadGeneratedCatalog(path = GENERATED_CATALOG): Catalog {
  if (!existsSync(path)) {
    throw new Error(`Catálogo não encontrado em ${path}. Rode "npm run catalog".`);
  }
  return JSON.parse(readFileSync(path, 'utf8')) as Catalog;
}
