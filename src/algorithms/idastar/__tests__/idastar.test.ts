import { describe, expect, it } from 'vitest';
import { mainGraph } from '../../../graphs/main-graph';
import { buildTrace } from '../../../simulation/buildTrace';
import { idastar } from '../index';
import { astar } from '../../astar';

describe('IDA* no grafo principal', () => {
  const trace = buildTrace(mainGraph, idastar);
  const final = trace.steps[trace.steps.length - 1].state;

  const iterationStarts = trace.steps
    .filter((s) => s.event.type === 'ITERATION_START')
    .map((s) => (s.event as { limit: number }).limit);

  it('roda três iterações, com limites 4 → 7 → 8', () => {
    // 4 = h(S); 7 = menor f podado na 1ª rodada; 8 = menor f podado na 2ª.
    expect(iterationStarts).toEqual([4, 7, 8]);
  });

  it('encontra o caminho ótimo S → B → F → G, custo 8', () => {
    expect(final.status).toBe('solved');
    expect(final.solutionPath).toEqual(['S', 'B', 'F', 'G']);
    expect(final.totalCost).toBe(8);
    expect(trace.summary.isOptimal).toBe(true);
  });

  it('o novo limite é sempre o MENOR f podado, nunca um chute', () => {
    const ends = trace.steps
      .filter((s) => s.event.type === 'ITERATION_END')
      .map((s) => s.event as { exhaustedLimit: number; nextLimit: number | null });

    expect(ends.map((e) => [e.exhaustedLimit, e.nextLimit])).toEqual([
      [4, 7],
      [7, 8],
    ]);

    // Confere contra os f realmente podados em cada iteração.
    for (const end of ends) {
      const snapshot = trace.steps.find(
        (s) => s.event.type === 'ITERATION_END' && (s.event as { exhaustedLimit: number }).exhaustedLimit === end.exhaustedLimit,
      )!.state;
      const pruned = (snapshot.extra?.overLimitNodes ?? []).map((n) => n.f);
      expect(Math.min(...pruned)).toBe(end.nextLimit);
    }
  });

  it('na 1ª iteração (limite 4) poda D(11), E(7), B(8) e C(10)', () => {
    const firstEnd = trace.steps.find((s) => s.event.type === 'ITERATION_END')!;
    expect(firstEnd.state.extra?.overLimitNodes).toEqual([
      { node: 'D', f: 11 },
      { node: 'E', f: 7 },
      { node: 'B', f: 8 },
      { node: 'C', f: 10 },
    ]);
  });

  it('cada ITERATION_START zera o estado — nada é levado da rodada anterior', () => {
    const secondStart = trace.steps.filter((s) => s.event.type === 'ITERATION_START')[1].state;
    expect(secondStart.expanded).toEqual([]);
    expect(secondStart.extra?.overLimitNodes ?? []).toEqual([]);
    expect(secondStart.extra?.limit).toBe(7);
    expect(Object.keys(secondStart.discovered)).toEqual(['S']);
  });

  it('chega ao mesmo resultado do A*, mas guardando muito menos de cada vez', () => {
    const astarTrace = buildTrace(mainGraph, astar);
    const astarFinal = astarTrace.steps[astarTrace.steps.length - 1].state;

    expect(final.solutionPath).toEqual(astarFinal.solutionPath);
    expect(final.totalCost).toBe(astarFinal.totalCost);

    // É a troca central: fronteira grande do A* por memória proporcional
    // à profundidade no IDA*, pagando com trabalho repetido.
    const idaMaxFrontier = Math.max(...trace.steps.map((s) => s.state.frontier.length));
    expect(idaMaxFrontier).toBeLessThanOrEqual(astarFinal.metrics.maxFrontierSize);
  });

  it('refaz trabalho: S é expandido uma vez por iteração', () => {
    const expansionsOfS = trace.steps.filter(
      (s) => s.event.type === 'EXPAND_NODE' && (s.event as { node: string }).node === 'S',
    );
    expect(expansionsOfS).toHaveLength(3);
  });
});
