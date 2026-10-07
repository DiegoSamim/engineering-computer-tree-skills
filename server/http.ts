import type { IncomingMessage, ServerResponse } from 'node:http';

const MAX_BODY_BYTES = 5 * 1024 * 1024; // migrações de log podem ser grandes

export function sendJson(res: ServerResponse, status: number, body: unknown): void {
  const payload = JSON.stringify(body);
  res.writeHead(status, {
    'content-type': 'application/json; charset=utf-8',
    'content-length': Buffer.byteLength(payload),
    'cache-control': 'no-store',
  });
  res.end(payload);
}

export function sendError(res: ServerResponse, status: number, message: string): void {
  sendJson(res, status, { error: message });
}

/** Lê o corpo como JSON, com limite de tamanho para não virar vetor de memória. */
export function readJson(req: IncomingMessage): Promise<unknown> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    let size = 0;

    req.on('data', (chunk: Buffer) => {
      size += chunk.length;
      if (size > MAX_BODY_BYTES) {
        reject(new Error('corpo excede o tamanho máximo'));
        req.destroy();
        return;
      }
      chunks.push(chunk);
    });

    req.on('end', () => {
      if (chunks.length === 0) return resolve(undefined);
      try {
        resolve(JSON.parse(Buffer.concat(chunks).toString('utf8')));
      } catch {
        reject(new Error('JSON inválido'));
      }
    });

    req.on('error', reject);
  });
}

export type Handler = (req: IncomingMessage, res: ServerResponse) => Promise<void> | void;

export interface Route {
  method: string;
  path: string;
  handler: Handler;
}

/**
 * Roteador mínimo: casamento exato de método + caminho. São seis rotas — um
 * framework aqui traria dependência sem resolver problema nenhum.
 */
export function createRouter(routes: Route[]): Handler {
  const table = new Map(routes.map((r) => [`${r.method} ${r.path}`, r.handler]));

  return async (req, res) => {
    const path = (req.url ?? '/').split('?')[0].replace(/\/+$/, '') || '/';
    const handler = table.get(`${req.method} ${path}`);

    if (!handler) return sendError(res, 404, `rota não encontrada: ${req.method} ${path}`);

    try {
      await handler(req, res);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      console.error(`[api] erro em ${req.method} ${path}:`, message);
      if (!res.headersSent) sendError(res, 500, message);
    }
  };
}
