import { describe, expect, it } from 'vitest';
import { mainGraph } from '../../../graphs/main-graph';
import { buildTrace } from '../../../simulation/buildTrace';
import { dfs } from '../index';

describe('DFS on the main graph', () => {
  const trace = buildTrace(mainGraph, dfs);
  const final = trace.steps[trace.steps.length - 1].state;

  it('discovers S, A, B, C as soon as S is expanded, then dives into A first', () => {
    // Discovery includes every generated successor (B, C included, even
    // though they are never themselves expanded) — expansion order below
    // is what actually shows the depth-first dive.
    expect(Object.keys(final.discovered)).toEqual(['S', 'A', 'B', 'C', 'D', 'E', 'H', 'X', 'G']);
  });

  it('expands S, A, D, H, X, E in that order — a single dive down the A branch', () => {
    // G is goal-tested and the search stops before G itself is expanded.
    expect(final.expanded).toEqual(['S', 'A', 'D', 'H', 'X', 'E']);
  });

  it('hits the dead end at X', () => {
    expect(final.deadEnds).toEqual(['X']);
  });

  it('backtracks X -> H -> D -> A before trying E', () => {
    const backtracks = trace.steps
      .filter((s) => s.event.type === 'BACKTRACK')
      .map((s) => {
        const e = s.event as { from: string; to: string };
        return { from: e.from, to: e.to };
      });
    expect(backtracks).toEqual([
      { from: 'X', to: 'H' },
      { from: 'H', to: 'D' },
      { from: 'D', to: 'A' },
    ]);
  });

  it('finds S -> A -> E -> G, cost 14 — not the cheapest solution', () => {
    expect(final.status).toBe('solved');
    expect(final.solutionPath).toEqual(['S', 'A', 'E', 'G']);
    expect(final.totalCost).toBe(14);
  });

  it('is NOT optimal on this graph (optimal cost is 8)', () => {
    expect(trace.summary.isOptimal).toBe(false);
    expect(trace.summary.optimalCost).toBe(8);
  });

  it('never discovers F — B is never expanded, so its child F is never generated', () => {
    expect(final.discovered['F']).toBeUndefined();
  });

  it('B and C stay in the frontier, undiscovered-further, once the solution is found', () => {
    const remaining = final.frontier.map((e) => e.nodeId);
    expect(remaining).toEqual(['B', 'C']);
  });
});
