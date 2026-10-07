import { describe, expect, it } from 'vitest';
import { mainGraph } from '../../../graphs/main-graph';
import { buildTrace } from '../../../simulation/buildTrace';
import { astar } from '../index';
import { uniformCost } from '../../uniformCost';
import { greedy } from '../../greedy';

describe('A* no grafo principal', () => {
  const trace = buildTrace(mainGraph, astar);
  const final = trace.steps[trace.steps.length - 1].state;

  it('encontra o caminho ótimo S → B → F → G, custo 8', () => {
    expect(final.status).toBe('solved');
    expect(final.solutionPath).toEqual(['S', 'B', 'F', 'G']);
    expect(final.totalCost).toBe(8);
    expect(trace.summary.isOptimal).toBe(true);
  });

  it('expande S, A, E, B, F — nessa ordem de f crescente', () => {
    expect(final.expanded).toEqual(['S', 'A', 'E', 'B', 'F']);
  });

  it('ordena a fronteira por f após expandir S: A(4), B(8), C(10)', () => {
    const afterS = trace.steps.find(
      (s) => s.event.type === 'ADD_TO_FRONTIER' && s.state.expanded.length === 1,
    )!;
    expect(afterS.state.frontier.map((e) => `${e.nodeId}:${e.f}`)).toEqual(['A:4', 'B:8', 'C:10']);
  });

  it('é atraído por A e E como a Gulosa, mas se corrige e não fica com o caminho caro', () => {
    // A Gulosa cai em S→A→E→G (custo 14) seguindo só h. O A* visita os mesmos
    // A e E primeiro, mas g puxa o f para cima e a resposta acaba sendo outra.
    const greedyTrace = buildTrace(mainGraph, greedy);
    const greedyFinal = greedyTrace.steps[greedyTrace.steps.length - 1].state;

    expect(greedyFinal.solutionPath).toEqual(['S', 'A', 'E', 'G']);
    expect(final.expanded.slice(0, 3)).toEqual(['S', 'A', 'E']);
    expect(final.solutionPath).not.toEqual(greedyFinal.solutionPath);
  });

  it('corrige o custo de G de 14 (via E) para 8 (via F)', () => {
    const updates = trace.steps.filter((s) => s.event.type === 'UPDATE_FRONTIER');
    expect(updates).toHaveLength(1);

    const gBefore = trace.steps
      .filter((s) => s.state.discovered['G'])
      .map((s) => s.state.discovered['G'].g);
    expect(gBefore[0]).toBe(14);
    expect(updates[0].state.frontier.find((e) => e.nodeId === 'G')!.f).toBe(8);
  });

  it('chega ao mesmo ótimo do Custo Uniforme expandindo bem menos nós', () => {
    const ucsTrace = buildTrace(mainGraph, uniformCost);
    const ucsFinal = ucsTrace.steps[ucsTrace.steps.length - 1].state;

    expect(final.solutionPath).toEqual(ucsFinal.solutionPath);
    expect(final.totalCost).toBe(ucsFinal.totalCost);
    // É este o ganho da heurística: mesma resposta, menos trabalho.
    expect(final.expanded.length).toBeLessThan(ucsFinal.expanded.length);
    expect(ucsFinal.expanded.length).toBe(9);
    expect(final.expanded.length).toBe(5);
  });

  it('nunca chega a descobrir H nem X — o ramo morto é podado pelo f alto de D', () => {
    expect(final.discovered['H']).toBeUndefined();
    expect(final.discovered['X']).toBeUndefined();
    expect(final.discovered['D'].g).toBe(2);
  });
});
