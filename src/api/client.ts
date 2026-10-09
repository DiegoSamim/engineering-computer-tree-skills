import type { EventResponse, TreeState } from '../domain/tree/api';
import type { Catalog, ProgressEventInput } from '../domain/tree/types';

/** Chamadas à API local. O Vite faz proxy de /api, então não há CORS. */

async function request<T>(method: string, path: string, body?: unknown): Promise<T> {
  let res: Response;
  try {
    res = await fetch(path, {
      method,
      headers: body === undefined ? undefined : { 'content-type': 'application/json' },
      body: body === undefined ? undefined : JSON.stringify(body),
    });
  } catch {
    throw new Error('O servidor não respondeu. Ele está rodando na porta 8787?');
  }
  const json = (await res.json().catch(() => null)) as (T & { error?: string }) | null;
  if (!res.ok) throw new Error(json?.error ?? `Erro ${res.status} em ${path}`);
  return json as T;
}

export const api = {
  catalog: () => request<Catalog>('GET', '/api/catalog'),
  state: () => request<TreeState>('GET', '/api/state'),
  event: (event: ProgressEventInput) => request<EventResponse>('POST', '/api/events', event),
};
