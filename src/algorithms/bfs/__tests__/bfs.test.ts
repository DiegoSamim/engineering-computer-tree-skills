import { describe, expect, it } from 'vitest';
import { mainGraph } from '../../../graphs/main-graph';
import { buildTrace } from '../../../simulation/buildTrace';
import { bfs } from '../index';

describe('BFS on the main graph', () => {
  const trace = buildTrace(mainGraph, bfs);
  const final = trace.steps[trace.steps.length - 1].state;

  it('discovers nodes in breadth order: S, A, B, C, D, E, F, G', () => {
    expect(Object.keys(final.discovered)).toEqual(['S', 'A', 'B', 'C', 'D', 'E', 'F', 'G']);
  });

  it('finds the fewest-edges solution S -> C -> G, cost 12 — not the cheapest one', () => {
    expect(final.status).toBe('solved');
    expect(final.solutionPath).toEqual(['S', 'C', 'G']);
    expect(final.totalCost).toBe(12);
  });

  it('is NOT optimal on this graph (optimal cost is 8, via S -> B -> F -> G)', () => {
    expect(trace.summary.isOptimal).toBe(false);
    expect(trace.summary.optimalCost).toBe(8);
  });

  it('expands S, A, B, C before finding G (D, E, F are discovered but never expanded)', () => {
    expect(final.expanded).toEqual(['S', 'A', 'B', 'C']);
  });

  it('every intermediate snapshot is a distinct, immutable object', () => {
    const states = trace.steps.map((s) => s.state);
    expect(new Set(states).size).toBe(states.length);
  });

  it('every step carries non-empty narration text', () => {
    for (const step of trace.steps) {
      expect(step.narration.title.length).toBeGreaterThan(0);
    }
  });
});
