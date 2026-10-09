import { createServer, type Server } from 'node:http';
import type { AddressInfo } from 'node:net';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import type { EventResponse, TreeState } from '../../src/domain/tree/api.ts';
import type { Catalog } from '../../src/domain/tree/types.ts';
import { exemploCatalog } from '../../src/domain/tree/__fixtures__/exemplo.ts';
import { createRoutes } from '../routes.ts';
import { freshDb } from './helpers.ts';

let server: Server;
let base: string;

beforeAll(async () => {
  server = createServer(createRoutes(freshDb(exemploCatalog())));
  await new Promise<void>((resolve) => server.listen(0, '127.0.0.1', resolve));
  base = `http://127.0.0.1:${(server.address() as AddressInfo).port}`;
});

afterAll(() => new Promise<void>((resolve) => server.close(() => resolve())));

async function call<T>(method: string, path: string, body?: unknown): Promise<{ status: number; json: T }> {
  const res = await fetch(base + path, {
    method,
    headers: body === undefined ? undefined : { 'content-type': 'application/json' },
    body: body === undefined ? undefined : typeof body === 'string' ? body : JSON.stringify(body),
  });
  return { status: res.status, json: (await res.json()) as T };
}

describe('API', () => {
  it('GET /api/health', async () => {
    const { status, json } = await call<{ ok: boolean; nodes: number }>('GET', '/api/health');
    expect(status).toBe(200);
    expect(json).toMatchObject({ ok: true, nodes: 8 });
  });

  it('GET /api/catalog devolve o catálogo semeado', async () => {
    const { json } = await call<Catalog>('GET', '/api/catalog');
    expect(json.areas.map((a) => a.slug)).toEqual(['fund', 'dados', 'es']);
    expect(json.nodes.find((n) => n.slug === 'hashing')?.placements).toHaveLength(3);
  });

  it('GET /api/state devolve estados, contadores e totais', async () => {
    const { json } = await call<TreeState>('GET', '/api/state');
    expect(json.totals).toEqual({ done: 0, total: 8 });
    expect(json.nodes.arrays.state).toBe('disponivel');
    expect(json.branches['dados/indexacao']).toMatchObject({ total: 2, done: 0 });
    expect(json.user.displayName).toBeNull();
  });

  it('POST /api/events grava e devolve o estado novo', async () => {
    const first = await call<EventResponse>('POST', '/api/events', { type: 'criterio_marcado', node: 'two-pointers', criterion: 'variacoes' });
    expect(first.status).toBe(200);
    expect(first.json.recorded).toBe(true);
    expect(first.json.state.nodes['two-pointers']).toMatchObject({ level: 1, state: 'em_progresso' });
    expect(first.json.state.areas.fund).toMatchObject({ done: 1, xp: 10 });

    const again = await call<EventResponse>('POST', '/api/events', { type: 'criterio_marcado', node: 'two-pointers', criterion: 'variacoes' });
    expect(again.json.recorded).toBe(false);
  });

  it.each([
    ['corpo inválido', { type: 'criterio_marcado', node: 'two-pointers' }, 'exige "criterion"'],
    ['tipo desconhecido', { type: 'pulou', node: 'two-pointers' }, 'desconhecido'],
    ['nó desconhecido', { type: 'iniciou', node: 'fantasma' }, 'Nó desconhecido'],
    ['JSON quebrado', '{ não é json', 'JSON inválido'],
  ])('POST /api/events responde 400 para %s', async (_name, body, message) => {
    const { status, json } = await call<{ error: string }>('POST', '/api/events', body);
    expect(status).toBe(400);
    expect(json.error).toContain(message);
  });

  it('PATCH /api/me grava o nome', async () => {
    const { json } = await call<TreeState>('PATCH', '/api/me', { displayName: 'Diego' });
    expect(json.user.displayName).toBe('Diego');
  });

  it('export, import e reset', async () => {
    const exported = await call<{ version: number; events: unknown[] }>('GET', '/api/export');
    expect(exported.json.events).toHaveLength(1);

    const reset = await call<TreeState>('POST', '/api/reset');
    expect(reset.json.totals.done).toBe(0);

    const imported = await call<{ imported: number; state: TreeState }>('POST', '/api/import', exported.json);
    expect(imported.json.imported).toBe(1);
    expect(imported.json.state.nodes['two-pointers'].level).toBe(1);
  });

  it('rota inexistente é 404', async () => {
    expect((await call('GET', '/api/nada')).status).toBe(404);
  });
});
