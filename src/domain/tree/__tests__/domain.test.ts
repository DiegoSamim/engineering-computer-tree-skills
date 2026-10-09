import { describe, expect, it } from 'vitest';
import { indexCatalog } from '../catalogIndex.ts';
import { areaProgress, branchProgress, totalProgress } from '../counters.ts';
import { levelFromCriteria, levelName } from '../levels.ts';
import { dependents, explainRequirements, isRequirementMet, isUnlocked } from '../requirements.ts';
import { deriveNodeState, deriveStates } from '../state.ts';
import { xpFor } from '../xp.ts';
import { exemploCatalog } from '../__fixtures__/exemplo.ts';

const index = indexCatalog(exemploCatalog());
const node = (slug: string) => index.nodes.get(slug)!;

describe('levelFromCriteria', () => {
  const criteria = [
    { id: 'a', level: 1 },
    { id: 'b', level: 1 },
    { id: 'c', level: 2 },
    { id: 'd', level: 3 },
  ];

  it('é cumulativo: nível N exige todos os critérios ≤ N', () => {
    expect(levelFromCriteria(criteria, [], 3)).toBe(0);
    expect(levelFromCriteria(criteria, ['a'], 3)).toBe(0);
    expect(levelFromCriteria(criteria, ['a', 'b'], 3)).toBe(1);
    expect(levelFromCriteria(criteria, ['a', 'b', 'c', 'd'], 3)).toBe(3);
  });

  it('não pula um nível incompleto', () => {
    expect(levelFromCriteria(criteria, ['a', 'b', 'd'], 3)).toBe(1);
  });

  it('desmarcar baixa o nível', () => {
    expect(levelFromCriteria(criteria, ['a', 'c', 'd'], 3)).toBe(0);
  });

  it('nó sem critérios fica no nível 0', () => {
    expect(levelFromCriteria([], ['qualquer'], 3)).toBe(0);
  });

  it('nomeia os níveis padrão', () => {
    expect([1, 2, 3].map(levelName)).toEqual(['Entendi', 'Pratiquei', 'Dominei']);
    expect(levelName(4)).toBe('Nível 4');
  });
});

describe('requisitos', () => {
  it('requisito de branch sem tronco é cumprido por vacuidade, como a view', () => {
    expect(isRequirementMet(index, { branch: 'fund/padroes', minLevel: 1, strength: 'obrigatorio' }, {})).toBe(false);
    const semTronco = indexCatalog({ ...exemploCatalog(), nodes: [] });
    expect(isRequirementMet(semTronco, { branch: 'fund/padroes', minLevel: 1, strength: 'obrigatorio' }, {})).toBe(true);
  });

  it('recomendado nunca bloqueia', () => {
    const progress = { arrays: { level: 1, started: true }, hashing: { level: 1, started: true } };
    expect(isUnlocked(index, node('two-pointers'), progress)).toBe(true);
  });

  it('explica os requisitos agrupados como a UI mostra', () => {
    const groups = explainRequirements(index, node('two-pointers'), { arrays: { level: 1, started: true } });
    expect(groups.map((g) => ({ kind: g.kind, strength: g.strength, met: g.met, n: g.items.length }))).toEqual([
      { kind: 'e', strength: 'obrigatorio', met: true, n: 1 },
      { kind: 'ou', strength: 'obrigatorio', met: false, n: 2 },
      { kind: 'e', strength: 'recomendado', met: false, n: 1 },
    ]);
    expect(groups[2].items[0].target).toEqual({ type: 'branch', key: 'fund/complexidade', name: 'Complexidade e análise' });
    expect(groups[1].items.map((i) => i.target.type === 'node' && i.target.title)).toEqual(['Ordenação', 'Hash Map / Hash Set']);
  });

  it('lista o que um nó libera (só obrigatórios)', () => {
    expect(dependents(index, 'hashing').sort()).toEqual(['consistent-hashing', 'indice-hash', 'two-pointers']);
    expect(dependents(index, 'two-pointers')).toEqual(['sliding-window']);
    expect(dependents(index, 'big-o')).toEqual([]);
  });
});

describe('estado', () => {
  it('nível vence requisito: nó com nível conta mesmo bloqueado', () => {
    expect(deriveNodeState(node('sliding-window'), { level: 1, started: true }, false)).toBe('em_progresso');
  });

  it('iniciado sem nível é "estudando"', () => {
    expect(deriveNodeState(node('big-o'), { level: 0, started: true }, true)).toBe('estudando');
  });

  it('nível máximo é "dominado", respeitando max_level do nó', () => {
    expect(deriveNodeState(node('indice-hash'), { level: 2, started: true }, false)).toBe('dominado');
  });
});

describe('contadores', () => {
  const progress = { arrays: { level: 1, started: true }, hashing: { level: 3, started: true } };
  const states = deriveStates(index, progress);

  it('carta da branch conta espelhos', () => {
    expect(branchProgress(index, progress, states)['es/sd']).toEqual({
      total: 2,
      withContent: 0,
      done: 1,
      mastered: 1,
      trunkTotal: 2,
      trunkDone: 1,
    });
  });

  it('área conta só nós da casa', () => {
    expect(areaProgress(index, progress)).toEqual({
      fund: { done: 2, total: 6 },
      dados: { done: 0, total: 1 },
      es: { done: 0, total: 1 },
    });
    expect(totalProgress(index, progress)).toEqual({ done: 2, total: 8 });
  });
});

describe('xpFor', () => {
  it('marcar dá XP e desmarcar devolve', () => {
    expect(xpFor('criterio_marcado')).toBe(10);
    expect(xpFor('criterio_desmarcado')).toBe(-10);
    expect(xpFor('guia_lida')).toBe(0);
  });
});
