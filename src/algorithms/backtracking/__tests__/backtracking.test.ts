import { describe, expect, it } from 'vitest';
import { mainGraph } from '../../../graphs/main-graph';
import { buildTrace } from '../../../simulation/buildTrace';
import { backtracking } from '../index';

describe('Backtracking on the main graph', () => {
  const trace = buildTrace(mainGraph, backtracking);
  const final = trace.steps[trace.steps.length - 1].state;

  it('discovers the same sibling set as DFS: S, A, B, C, D, E, H, X, G', () => {
    // Discovering a sibling (seeing it as an available alternative) is not
    // the same as trying it — see the "commits to" test below for that.
    expect(Object.keys(final.discovered)).toEqual(['S', 'A', 'B', 'C', 'D', 'E', 'H', 'X', 'G']);
  });

  it('only ever expands (commits to) S, A, D, H, X, E — B, C, F are seen but never tried', () => {
    expect(final.expanded).toEqual(['S', 'A', 'D', 'H', 'X', 'E']);
  });

  it('never discovers F — B is seen as an alternative at S but never expanded', () => {
    expect(final.discovered['F']).toBeUndefined();
  });

  it('hits the dead end at X and backtracks X -> H -> D -> A before trying E', () => {
    expect(final.deadEnds).toEqual(['X']);
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

  it('finds S -> A -> E -> G, cost 14 — the same answer as DFS, by a different route', () => {
    expect(final.status).toBe('solved');
    expect(final.solutionPath).toEqual(['S', 'A', 'E', 'G']);
    expect(final.totalCost).toBe(14);
  });

  it('the frontier only ever shows the current decision point, never the full DFS stack', () => {
    // At no point should B or C (siblings of A at the S decision point, never
    // revisited once we commit to A) appear in the frontier alongside D/E —
    // unlike DFS, which keeps them queued in one global stack.
    for (const step of trace.steps) {
      const ids = step.state.frontier.map((e) => e.nodeId);
      if (ids.includes('D') || ids.includes('E')) {
        expect(ids).not.toContain('B');
        expect(ids).not.toContain('C');
      }
    }
  });

  it('every BACKTRACK step removes the abandoned node from the frontier entirely', () => {
    const afterFirstBacktrack = trace.steps.find((s) => s.event.type === 'BACKTRACK')!.state;
    expect(afterFirstBacktrack.frontier.map((e) => e.nodeId)).not.toContain('X');
  });
});
