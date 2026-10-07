import { describe, expect, it } from 'vitest';
import { mainGraph } from '../../../graphs/main-graph';
import { buildTrace } from '../../../simulation/buildTrace';
import { irrevocable } from '../index';

describe('Irrevocable search on the main graph', () => {
  const trace = buildTrace(mainGraph, irrevocable);
  const final = trace.steps[trace.steps.length - 1].state;

  it('commits to (expands) only the cheapest-edge chain: S -> A -> D -> H -> X', () => {
    // Discovery includes every sibling momentarily considered at each step
    // (B, C at S; E at A) — expansion is the real record of what this
    // search actually committed to, one edge at a time.
    expect(final.expanded).toEqual(['S', 'A', 'D', 'H', 'X']);
    expect(final.currentPath).toEqual(['S', 'A', 'D', 'H', 'X']);
  });

  it('discovers every immediate sibling it compared, even the ones it rejects', () => {
    expect(Object.keys(final.discovered)).toEqual(['S', 'A', 'B', 'C', 'D', 'E', 'H', 'X']);
  });

  it('fails at the X dead end, even though a solution exists via S -> B -> F -> G', () => {
    expect(final.status).toBe('failed');
    expect(final.deadEnds).toEqual(['X']);
    expect(trace.summary.found).toBe(false);
  });

  it('never commits to (expands) B, C, or E — only the cheapest edge at each step is followed', () => {
    expect(final.expanded).not.toContain('B');
    expect(final.expanded).not.toContain('C');
    expect(final.expanded).not.toContain('E');
  });

  it('discards the rejected edges: S->B, S->C, and A->E all end up marked discarded', () => {
    expect(final.discardedEdges).toEqual(expect.arrayContaining(['S->B', 'S->C', 'A->E']));
  });

  it('keeps no frontier once the run gets going (after the initial INIT snapshot)', () => {
    for (const step of trace.steps.slice(1)) {
      expect(step.state.frontier).toEqual([]);
    }
  });

  it('tracks depth and accumulated cost correctly despite having no frontier entries', () => {
    // S -> A -> D -> H -> X, all edges cost 1, so depth 4 / cost 4 at the end.
    expect(final.depth).toBe(4);
    expect(final.totalCost).toBe(4);
  });
});
