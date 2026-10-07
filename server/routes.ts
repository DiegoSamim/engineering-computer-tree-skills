import { SCHEMA_VERSION } from '../src/data/types.ts';
import { createRouter, readJson, sendError, sendJson, type Route } from './http.ts';
import { SqliteProgressStore, UnknownTopicError } from './store.ts';
import { validateEvent, validateImport } from './validate.ts';

export function createRoutes(store: SqliteProgressStore) {
  const startedAt = Date.now();

  const routes: Route[] = [
    {
      method: 'GET',
      path: '/api/health',
      handler: (_req, res) =>
        sendJson(res, 200, {
          ok: true,
          schemaVersion: SCHEMA_VERSION,
          events: store.eventCount(),
          uptimeSeconds: Math.round((Date.now() - startedAt) / 1000),
        }),
    },

    {
      // O snapshot inteiro em uma chamada — é isto que faz abrir o app não
      // exigir remarcar nada do que já foi feito.
      method: 'GET',
      path: '/api/progress',
      handler: (_req, res) => sendJson(res, 200, store.load()),
    },

    {
      method: 'POST',
      path: '/api/progress/events',
      handler: async (req, res) => {
        const parsed = validateEvent(await readJson(req));
        if (!parsed.ok) return sendError(res, 400, parsed.error);

        try {
          return sendJson(res, 200, store.append(parsed.value));
        } catch (error) {
          if (error instanceof UnknownTopicError) return sendError(res, 400, error.message);
          throw error;
        }
      },
    },

    {
      method: 'GET',
      path: '/api/export',
      handler: (_req, res) => sendJson(res, 200, store.exportLog()),
    },

    {
      method: 'POST',
      path: '/api/import',
      handler: async (req, res) => {
        const parsed = validateImport(await readJson(req));
        if (!parsed.ok) return sendError(res, 400, parsed.error);

        const result = store.importLog(parsed.value);
        return sendJson(res, 200, {
          snapshot: result.snapshot,
          imported: result.imported,
          skipped: result.skipped,
        });
      },
    },

    {
      method: 'POST',
      path: '/api/reset',
      handler: (_req, res) => sendJson(res, 200, store.reset()),
    },
  ];

  return createRouter(routes);
}
