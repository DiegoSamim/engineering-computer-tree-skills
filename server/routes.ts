import { createRouter, sendJson, type Route } from './http.ts';

export function createRoutes() {
  const startedAt = Date.now();

  const routes: Route[] = [
    {
      method: 'GET',
      path: '/api/health',
      handler: (_req, res) =>
        sendJson(res, 200, {
          ok: true,
          uptimeSeconds: Math.round((Date.now() - startedAt) / 1000),
        }),
    },
  ];

  return createRouter(routes);
}
