import type { EventResponse } from '../src/domain/tree/api.ts';
import { indexCatalog } from '../src/domain/tree/catalogIndex.ts';
import { readCatalog } from './catalog/read.ts';
import type { Db } from './db.ts';
import { createRouter, readJson, sendError, sendJson, type Handler, type Route } from './http.ts';
import { validateEvent, validateImport, validateProfile } from './progress/events.ts';
import { readState } from './progress/state.ts';
import { ProgressStore } from './progress/store.ts';

/**
 * API da skill tree. O catálogo é lido do banco uma vez (ele só muda no boot,
 * com o seed); o estado é lido a cada pedido, das views.
 */
export function createRoutes(db: Db, store = new ProgressStore(db)): Handler {
  const startedAt = Date.now();
  const catalog = readCatalog(db);
  const index = indexCatalog(catalog);
  const state = () => readState(db, index);

  const routes: Route[] = [
    {
      method: 'GET',
      path: '/api/health',
      handler: (_req, res) =>
        sendJson(res, 200, {
          ok: true,
          nodes: catalog.nodes.length,
          events: store.eventCount(),
          uptimeSeconds: Math.round((Date.now() - startedAt) / 1000),
        }),
    },

    { method: 'GET', path: '/api/catalog', handler: (_req, res) => sendJson(res, 200, catalog) },

    { method: 'GET', path: '/api/state', handler: (_req, res) => sendJson(res, 200, state()) },

    {
      method: 'POST',
      path: '/api/events',
      handler: async (req, res) => {
        const parsed = validateEvent(await readJson(req));
        if (!parsed.ok) return sendError(res, 400, parsed.error);
        const recorded = store.append(parsed.value);
        const body: EventResponse = { recorded, state: state() };
        return sendJson(res, 200, body);
      },
    },

    {
      method: 'PATCH',
      path: '/api/me',
      handler: async (req, res) => {
        const parsed = validateProfile(await readJson(req));
        if (!parsed.ok) return sendError(res, 400, parsed.error);
        store.setDisplayName(parsed.value.displayName);
        return sendJson(res, 200, state());
      },
    },

    { method: 'GET', path: '/api/export', handler: (_req, res) => sendJson(res, 200, store.exportLog()) },

    {
      method: 'POST',
      path: '/api/import',
      handler: async (req, res) => {
        const parsed = validateImport(await readJson(req));
        if (!parsed.ok) return sendError(res, 400, parsed.error);
        const result = store.importLog(parsed.value);
        return sendJson(res, 200, { ...result, state: state() });
      },
    },

    {
      method: 'POST',
      path: '/api/reset',
      handler: (_req, res) => {
        store.reset();
        return sendJson(res, 200, state());
      },
    },
  ];

  return createRouter(routes);
}
