import { describe, expect, it } from 'vitest';
import type { TreeState } from '../../domain/tree/api';
import { indexCatalog } from '../../domain/tree/catalogIndex';
import { areaProgress, branchProgress, totalProgress } from '../../domain/tree/counters';
import { deriveStates } from '../../domain/tree/state';
import type { ProgressMap } from '../../domain/tree/types';
import { exemploCatalog } from '../../domain/tree/__fixtures__/exemplo';
import {
  cardPosition,
  carouselLayout,
  constellationView,
  firstBranchWithNodes,
  levelChangeMessage,
  nodeView,
  px,
  py,
  requireLine,
} from '../views';

const index = indexCatalog(exemploCatalog());

/** TreeState como o servidor montaria, a partir de níveis. */
function stateFrom(progress: ProgressMap): TreeState {
  const states = deriveStates(index, progress);
  return {
    user: { displayName: null },
    totals: totalProgress(index, progress),
    areas: Object.fromEntries(Object.entries(areaProgress(index, progress)).map(([k, v]) => [k, { ...v, xp: 0 }])),
    branches: branchProgress(index, progress, states),
    nodes: Object.fromEntries(
      index.catalog.nodes.map((n) => [
        n.slug,
        {
          level: progress[n.slug]?.level ?? 0,
          state: states[n.slug],
          startedAt: progress[n.slug]?.started ? '2026-10-09T10:00:00Z' : null,
          completedAt: null,
          secondsStudied: 0,
          criteria: [],
          guides: [],
          exercises: {},
        },
      ]),
    ),
  };
}

const lvl = (level: number) => ({ level, started: true });

describe('constellationView', () => {
  it('posiciona estrelas no viewBox do protótipo', () => {
    const { stars } = constellationView(index, stateFrom({}), 'fund/padroes', true);
    const tp = stars.find((s) => s.slug === 'two-pointers')!;
    expect([tp.cx, tp.cy]).toEqual([px(0.5), py(0.3)]);
    expect([px(0), px(1), py(0), py(1)]).toEqual([50, 550, 34, 474]);
    expect(tp.r).toBe(12);
    expect(stars.find((s) => s.slug === 'ordenacao')!.r).toBe(9);
  });

  it('desenha só requisitos obrigatórios entre nós da mesma branch', () => {
    const { edges } = constellationView(index, stateFrom({}), 'fund/padroes', true);
    // Arrays e Hashing ficam em outra branch; Complexidade é recomendado e de branch.
    expect(edges.map((e) => e.key).sort()).toEqual(['ordenacao->two-pointers', 'two-pointers->sliding-window']);
  });

  it('acende a linha cumprida e tracejado marca alternativa OU', () => {
    const before = constellationView(index, stateFrom({}), 'fund/padroes', true).edges;
    expect(before.map((e) => [e.key, e.lit, e.alt])).toEqual([
      ['ordenacao->two-pointers', false, true],
      ['two-pointers->sliding-window', false, false],
    ]);
    const after = constellationView(index, stateFrom({ 'two-pointers': lvl(2) }), 'fund/padroes', true).edges;
    expect(after.find((e) => e.to === 'sliding-window')?.lit).toBe(true);
  });

  it('marca espelho com a cor e o nome da casa', () => {
    const { stars } = constellationView(index, stateFrom({}), 'dados/indexacao', false);
    const hashing = stars.find((s) => s.slug === 'hashing')!;
    expect(hashing).toMatchObject({ mirror: true, homeColor: '#f5c46b', homeBranchName: 'Estruturas de dados', r: 13 });
    expect(stars.find((s) => s.slug === 'indice-hash')!.mirror).toBe(false);
  });
});

describe('nodeView e requireLine', () => {
  it('agrupa requisitos, marca área diferente e lista o que libera', () => {
    const view = nodeView(index, stateFrom({ arrays: lvl(1) }), 'two-pointers', 'fund/padroes')!;
    expect(view.mirror).toBe(false);
    expect(view.unlocks).toEqual([{ slug: 'sliding-window', title: 'Sliding Window', otherArea: undefined }]);
    expect(requireLine(view)).toEqual([
      { met: true, label: 'Arrays' },
      { met: false, label: 'Ordenação ou Hash Map / Hash Set' },
    ]);
  });

  it('libera nós de outra área com o nome e a cor dela', () => {
    const view = nodeView(index, stateFrom({}), 'hashing', 'dados/indexacao')!;
    expect(view.mirror).toBe(true);
    expect(view.unlocks.find((u) => u.slug === 'indice-hash')?.otherArea).toEqual({ name: 'Dados', color: '#ff9e6b' });
  });

  it('devolve null para slug desconhecido', () => {
    expect(nodeView(index, stateFrom({}), 'fantasma')).toBeNull();
  });
});

describe('levelChangeMessage', () => {
  const base = { arrays: lvl(1), hashing: lvl(1) };

  it('avisa subida de nível e o que foi liberado', () => {
    const before = stateFrom({ ...base, 'two-pointers': lvl(1) });
    const after = stateFrom({ ...base, 'two-pointers': lvl(2) });
    expect(levelChangeMessage(index, before, after, 'two-pointers')).toBe('Nível 2 atingido · Sliding Window liberado');
  });

  it('avisa subida sem liberação', () => {
    expect(levelChangeMessage(index, stateFrom(base), stateFrom({ ...base, 'two-pointers': lvl(1) }), 'two-pointers')).toBe(
      'Nível 1 atingido',
    );
  });

  it('avisa descida e cala quando nada mudou', () => {
    const two = stateFrom({ ...base, 'two-pointers': lvl(2) });
    expect(levelChangeMessage(index, two, stateFrom({ ...base, 'two-pointers': lvl(1) }), 'two-pointers')).toBe('Voltou ao nível 1');
    expect(levelChangeMessage(index, two, two, 'two-pointers')).toBeNull();
  });
});

describe('carrossel', () => {
  it('carta entre 240 e 400px, centralizada', () => {
    expect(carouselLayout(1280, 0)).toEqual({ cardWidth: 400, gap: 12, offset: 440 });
    expect(carouselLayout(1280, 2).offset).toBe(440 - 2 * 412);
    expect(carouselLayout(390, 0)).toEqual({ cardWidth: 240, gap: 0, offset: 75 });
  });

  it('classifica central, vizinha e distante', () => {
    expect([0, 1, 2, 3].map((i) => cardPosition(i, 1))).toEqual(['near', 'on', 'near', 'far']);
  });

  it('abre na primeira branch com nós', () => {
    expect(firstBranchWithNodes(index, 'fund')).toBe(0);
    expect(firstBranchWithNodes(index, 'inexistente')).toBe(0);
  });
});
