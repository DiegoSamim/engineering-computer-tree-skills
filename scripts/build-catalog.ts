/**
 * Gera src/generated/catalog.json a partir de content/.
 *
 *   node --experimental-strip-types scripts/build-catalog.ts [--dir content] [--out caminho] [--check]
 *
 * --check valida sem gravar. Sai com código 1 se houver qualquer erro: o
 * build, os testes e o servidor dependem de um catálogo válido.
 */
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { parseArgs } from 'node:util';
import { loadCatalog } from './catalog/load.ts';

const { values } = parseArgs({
  options: {
    dir: { type: 'string', default: 'content' },
    out: { type: 'string', default: 'src/generated/catalog.json' },
    check: { type: 'boolean', default: false },
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
