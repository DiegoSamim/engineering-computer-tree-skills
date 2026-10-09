import { beforeEach, describe, expect, it } from 'vitest';
import { indexCatalog } from '../../src/domain/tree/catalogIndex.ts';
import { exemploCatalog } from '../../src/domain/tree/__fixtures__/exemplo.ts';
import type { Db } from '../db.ts';
import { HttpError } from '../http.ts';
import { readState } from '../progress/state.ts';
import { ProgressStore } from '../progress/store.ts';
import { freshDb } from './helpers.ts';

const T = (minute: number) => `2026-10-09T10:${String(minute).padStart(2, '0')}:00.000Z`;

describe('ProgressStore', () => {
  let db: Db;
  let store: ProgressStore;
  const index = indexCatalog(exemploCatalog());
  const state = () => readState(db, index);
  const tp = () => state().nodes['two-pointers'];

  beforeEach(() => {
    db = freshDb(exemploCatalog());
    store = new ProgressStore(db);
  });

  it('parte do zero', () => {
    expect(store.eventCount()).toBe(0);
    expect(tp()).toMatchObject({ level: 0, state: 'bloqueado', startedAt: null, criteria: [] });
  });

  it('nível sobe com os critérios e desce ao desmarcar', () => {
    store.append({ type: 'criterio_marcado', node: 'two-pointers', criterion: 'variacoes' }, T(1));
    expect(tp()).toMatchObject({ level: 1, state: 'em_progresso', startedAt: T(1), criteria: ['variacoes'] });

    store.append({ type: 'criterio_marcado', node: 'two-pointers', criterion: 'medios' }, T(2));
    expect(state().nodes['sliding-window'].state).toBe('disponivel');

    store.append({ type: 'criterio_marcado', node: 'two-pointers', criterion: 'retencao' }, T(3));
    expect(tp()).toMatchObject({ level: 3, state: 'dominado', completedAt: T(3) });

    store.append({ type: 'criterio_desmarcado', node: 'two-pointers', criterion: 'variacoes' }, T(4));
    expect(tp()).toMatchObject({ level: 0, state: 'estudando', completedAt: null, criteria: ['medios', 'retencao'] });
    expect(state().nodes['sliding-window'].state).toBe('bloqueado');
  });

  it('marcar o que já está marcado não grava evento nem XP', () => {
    expect(store.append({ type: 'criterio_marcado', node: 'two-pointers', criterion: 'variacoes' })).toBe(true);
    expect(store.append({ type: 'criterio_marcado', node: 'two-pointers', criterion: 'variacoes' })).toBe(false);
    expect(store.append({ type: 'criterio_desmarcado', node: 'two-pointers', criterion: 'medios' })).toBe(false);
    expect(store.eventCount()).toBe(1);
    expect(state().areas.fund.xp).toBe(10);
  });

  it('XP vai só para a área-casa e desmarcar devolve', () => {
    store.append({ type: 'criterio_marcado', node: 'two-pointers', criterion: 'variacoes' });
    store.append({ type: 'criterio_marcado', node: 'two-pointers', criterion: 'medios' });
    store.append({ type: 'criterio_desmarcado', node: 'two-pointers', criterion: 'medios' });
    expect(state().areas).toMatchObject({ fund: { xp: 10 }, dados: { xp: 0 }, es: { xp: 0 } });
  });

  it('iniciar, ler guias, exercícios e sessões', () => {
    store.append({ type: 'iniciou', node: 'big-o' }, T(1));
    expect(store.append({ type: 'iniciou', node: 'big-o' }, T(2))).toBe(false);
    expect(state().nodes['big-o']).toMatchObject({ state: 'estudando', startedAt: T(1) });

    store.append({ type: 'guia_lida', node: 'two-pointers', guide: 'visao-geral' });
    store.append({ type: 'guia_lida', node: 'two-pointers', guide: 'intuicao' });
    store.append({ type: 'guia_desmarcada', node: 'two-pointers', guide: 'visao-geral' });
    expect(tp().guides).toEqual(['intuicao']);

    store.append({ type: 'exercicio_tentado', node: 'two-pointers', exercise: 'two-sum-ii' }, T(3));
    store.append({ type: 'exercicio_resolvido', node: 'two-pointers', exercise: 'two-sum-ii' }, T(4));
    expect(store.append({ type: 'exercicio_resolvido', node: 'two-pointers', exercise: 'two-sum-ii' }, T(5))).toBe(false);
    expect(tp().exercises).toEqual({ 'two-sum-ii': { attempts: 2, solvedAt: T(4) } });

    store.append({ type: 'exercicio_desmarcado', node: 'two-pointers', exercise: 'two-sum-ii' }, T(6));
    expect(store.append({ type: 'exercicio_desmarcado', node: 'two-pointers', exercise: 'two-sum-ii' }, T(7))).toBe(false);
    expect(tp().exercises).toEqual({ 'two-sum-ii': { attempts: 2, solvedAt: null } });
    store.append({ type: 'exercicio_resolvido', node: 'two-pointers', exercise: 'two-sum-ii' }, T(8));
    expect(tp().exercises['two-sum-ii'].solvedAt).toBe(T(8));

    store.append({ type: 'sessao_estudo', node: 'two-pointers', seconds: 300 });
    store.append({ type: 'sessao_estudo', node: 'two-pointers', seconds: 120 });
    expect(tp().secondsStudied).toBe(420);
    // Nenhuma dessas atividades sobe nível: só critérios fazem isso.
    expect(tp().level).toBe(0);
  });

  it('recusa referências desconhecidas com 400, sem sujar o log', () => {
    const cases = [
      { type: 'iniciou', node: 'fantasma' },
      { type: 'criterio_marcado', node: 'two-pointers', criterion: 'fantasma' },
      { type: 'guia_lida', node: 'two-pointers', guide: 'capitulo-9' },
      { type: 'exercicio_resolvido', node: 'two-pointers', exercise: 'fantasma' },
    ] as const;
    for (const input of cases) {
      expect(() => store.append(input)).toThrow(HttpError);
    }
    expect(store.eventCount()).toBe(0);
  });

  it('desfaz a transação inteira quando a materialização falha', () => {
    db.exec('DROP TABLE user_guide');
    expect(() => store.append({ type: 'guia_lida', node: 'two-pointers', guide: 'visao-geral' })).toThrow();
    expect(store.eventCount()).toBe(0);
  });

  it('rebuild() refaz o estado a partir do log', () => {
    store.append({ type: 'criterio_marcado', node: 'two-pointers', criterion: 'variacoes' }, T(1));
    store.append({ type: 'guia_lida', node: 'two-pointers', guide: 'codigo' }, T(2));
    const before = state();

    db.exec('UPDATE user_node SET level = 3');
    db.exec('DELETE FROM user_guide');
    expect(tp().level).toBe(3);

    store.rebuild();
    expect(state()).toEqual(before);
  });

  it('export/import preserva os instantes e o estado', () => {
    store.append({ type: 'criterio_marcado', node: 'two-pointers', criterion: 'variacoes' }, T(1));
    store.append({ type: 'sessao_estudo', node: 'two-pointers', seconds: 600 }, T(2));
    const exported = store.exportLog();
    expect(exported.events).toEqual([
      { type: 'criterio_marcado', node: 'two-pointers', criterion: 'variacoes', occurredAt: T(1) },
      { type: 'sessao_estudo', node: 'two-pointers', seconds: 600, occurredAt: T(2) },
    ]);

    const other = freshDb(exemploCatalog());
    const otherStore = new ProgressStore(other);
    expect(otherStore.importLog({ ...exported, events: [...exported.events, { type: 'iniciou', node: 'fantasma', occurredAt: T(3) }] })).toEqual({
      imported: 2,
      skipped: 1,
    });
    expect(otherStore.exportLog()).toEqual(exported);
    expect(readState(other, index)).toEqual(state());
  });

  it('reset() zera log e estado', () => {
    store.append({ type: 'criterio_marcado', node: 'two-pointers', criterion: 'variacoes' });
    store.reset();
    expect(store.eventCount()).toBe(0);
    expect(tp()).toMatchObject({ level: 0, criteria: [] });
  });
});
