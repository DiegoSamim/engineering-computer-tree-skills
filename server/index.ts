import { createServer } from 'node:http';
import { openDatabase } from './db.ts';
import { migrate } from './migrations/run.ts';
import { createRoutes } from './routes.ts';

const PORT = Number(process.env.PORT ?? 8787);
const HOST = process.env.HOST ?? '127.0.0.1';
const DB_PATH = process.env.DB_PATH ?? 'data/study.db';

const db = openDatabase(DB_PATH);

const { applied, current } = migrate(db);
if (applied.length > 0) console.log(`[api] migrations aplicadas: ${applied.join(', ')}`);

const server = createServer(createRoutes());

server.listen(PORT, HOST, () => {
  console.log(`[api] ouvindo em http://${HOST}:${PORT}`);
  console.log(`[api] banco: ${DB_PATH} (schema v${current})`);
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
