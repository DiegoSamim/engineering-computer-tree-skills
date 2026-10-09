import { existsSync } from 'node:fs';
import { createServer } from 'node:http';
import { resolve } from 'node:path';
import { loadGeneratedCatalog } from './catalog/load.ts';
import { seedCatalog } from './catalog/seed.ts';
import { validateCatalogSql } from './catalog/validateSql.ts';
import { openDatabase } from './db.ts';
import { migrate } from './migrations/run.ts';
import { ProgressStore } from './progress/store.ts';
import { createRoutes } from './routes.ts';

const PORT = Number(process.env.PORT ?? 8787);
const HOST = process.env.HOST ?? '127.0.0.1';
const DB_PATH = process.env.DB_PATH ?? 'data/skill-tree.db';
const OLD_DB_PATH = 'data/study.db';

// O progresso do roadmap antigo era de outro modelo e não é migrado.
if (existsSync(OLD_DB_PATH) && resolve(OLD_DB_PATH) !== resolve(DB_PATH)) {
  console.warn(`[api] aviso: o progresso antigo (${OLD_DB_PATH}) não é migrado para a skill tree; o arquivo fica intacto.`);
}

const db = openDatabase(DB_PATH);

const { applied, current } = migrate(db);
if (applied.length > 0) console.log(`[api] migrations aplicadas: ${applied.join(', ')}`);

const catalog = loadGeneratedCatalog();
const seeded = seedCatalog(db, catalog);
if (seeded.removed.length > 0) console.log(`[api] nós removidos do catálogo: ${seeded.removed.join(', ')}`);

const sqlErrors = validateCatalogSql(db);
if (sqlErrors.length > 0) {
  console.error('[api] catálogo inválido no banco:');
  for (const e of sqlErrors) console.error(`  - [${e.code}] ${e.detail}`);
  process.exit(1);
}

// O estado materializado acompanha o catálogo atual (critérios podem ter mudado).
const store = new ProgressStore(db);
store.rebuild();

const server = createServer(createRoutes(db, store));

server.listen(PORT, HOST, () => {
  console.log(`[api] ouvindo em http://${HOST}:${PORT}`);
  console.log(
    `[api] banco: ${DB_PATH} (schema v${current}) · catálogo: ${seeded.areas} áreas, ${seeded.branches} branches, ${seeded.nodes} nós`,
  );
  console.log(`[api] eventos registrados: ${store.eventCount()}`);
});

// Fecha o banco de forma limpa para o WAL não ficar com checkpoint pendente
// quando a janela do launcher é fechada.
for (const signal of ['SIGINT', 'SIGTERM'] as const) {
  process.on(signal, () => {
    console.log(`\n[api] ${signal} recebido, encerrando...`);
    server.close(() => {
      db.close();
      process.exit(0);
    });
  });
}
