import { describe, expect, it } from 'vitest';
import { mainGraph } from '../../../graphs/main-graph';
import { buildTrace } from '../../../simulation/buildTrace';
import { uniformCost } from '../index';

describe('Uniform-Cost Search on the main graph', () => {
  const trace = buildTrace(mainGraph, uniformCost);
  const final = trace.steps[trace.steps.length - 1].state;

  it('expands in ascending order of g(n): S, A, C, D, H, B, X, E, F', () => {
    expect(final.expanded).toEqual(['S', 'A', 'C', 'D', 'H', 'B', 'X', 'E', 'F']);
  });

  it('finds the optimal solution S -> B -> F -> G, cost 8', () => {
    expect(final.status).toBe('solved');
    expect(final.solutionPath).toEqual(['S', 'B', 'F', 'G']);
    expect(final.totalCost).toBe(8);
  });

  it('IS optimal on this graph — the whole point of uniform cost over BFS', () => {
    expect(trace.summary.isOptimal).toBe(true);
    expect(trace.summary.optimalCost).toBe(8);
  });

  it('the frontier right after expanding S is exactly A(g=1), C(g=2), B(g=4), in that order', () => {
    const afterS = trace.steps.find(
      (s) => s.event.type === 'ADD_TO_FRONTIER' && s.state.expanded.length === 1,
    )!;
    expect(afterS.state.frontier.map((e) => `${e.nodeId}:${e.g}`)).toEqual(['A:1', 'C:2', 'B:4']);
  });

  it('corrects course: rejects the worse S->A->E->G path to G (g=14), then accepts the cheaper S->B->F->G one (g=8)', () => {
    const skips = trace.steps.filter((s) => s.event.type === 'SKIP_NODE');
    expect(skips).toHaveLength(1);
    const skipEvent = skips[0].event as { node: string; reason: string };
    expect(skipEvent.node).toBe('G');
    expect(skipEvent.reason).toBe('worse-path');

    const updates = trace.steps.filter((s) => s.event.type === 'UPDATE_FRONTIER');
    expect(updates).toHaveLength(1);
    const gEntry = updates[0].state.frontier.find((e) => e.nodeId === 'G')!;
    expect(gEntry.g).toBe(8);
  });

  it('never re-discovers B or C once they enter the frontier — no duplicate DISCOVER_NODES', () => {
    const discoveredNodes = trace.steps
      .filter((s) => s.event.type === 'DISCOVER_NODES')
      .flatMap((s) => (s.event as { discoveries: { node: string }[] }).discoveries.map((d) => d.node));
    expect(new Set(discoveredNodes).size).toBe(discoveredNodes.length);
  });
});
