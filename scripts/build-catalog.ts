/**
 * Gera src/generated/catalog.json a partir de content/.
 *
 *   node --experimental-strip-types scripts/build-catalog.ts [--dir content] [--out caminho] [--check] [--seed banco.db]
 *
 * --check valida sem gravar. --seed também semeia o banco indicado (o mesmo
 * que o servidor faz no boot), sem precisar subir a API.
 *
 * Sai com código 1 se houver qualquer erro: o build, os testes e o servidor
 * dependem de um catálogo válido.
 */
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { parseArgs } from 'node:util';
import { seedCatalog } from '../server/catalog/seed.ts';
import { validateCatalogSql } from '../server/catalog/validateSql.ts';
import { openDatabase } from '../server/db.ts';
import { migrate } from '../server/migrations/run.ts';
import { ProgressStore } from '../server/progress/store.ts';
import { loadCatalog } from './catalog/load.ts';

const { values } = parseArgs({
  options: {
    dir: { type: 'string', default: 'content' },
    out: { type: 'string', default: 'src/generated/catalog.json' },
    check: { type: 'boolean', default: false },
    seed: { type: 'string' },
  },
});

const { catalog, errors } = loadCatalog({ contentDir: resolve(values.dir) });

if (errors.length > 0) {
  console.error(`[catálogo] ${errors.length} erro(s):`);
  for (const error of errors) console.error(`  - ${error}`);
  process.exit(1);
}

if (!values.check) {
  const out = resolve(values.out);
  mkdirSync(dirname(out), { recursive: true });
  writeFileSync(out, `${JSON.stringify(catalog, null, 2)}\n`);
}

console.log(
  `[catálogo] ${catalog.areas.length} áreas · ${catalog.branches.length} branches · ${catalog.nodes.length} nós · 0 erros` +
    (values.check ? ' (só validação)' : ` → ${values.out}`),
);

if (values.seed) {
  const db = openDatabase(resolve(values.seed));
  migrate(db);
  const seeded = seedCatalog(db, catalog);
  const sqlErrors = validateCatalogSql(db);
  if (sqlErrors.length > 0) {
    console.error('[catálogo] o banco acusou erros depois do seed:');
    for (const e of sqlErrors) console.error(`  - [${e.code}] ${e.detail}`);
    process.exit(1);
  }
  new ProgressStore(db).rebuild();
  db.close();
  console.log(`[catálogo] banco semeado: ${values.seed}${seeded.removed.length ? ` (removidos: ${seeded.removed.join(', ')})` : ''}`);
}
