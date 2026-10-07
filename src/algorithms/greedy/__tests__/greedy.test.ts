import { describe, expect, it } from 'vitest';
import { mainGraph } from '../../../graphs/main-graph';
import { buildTrace } from '../../../simulation/buildTrace';
import { greedy } from '../index';

describe('Greedy Best-First Search on the main graph', () => {
  const trace = buildTrace(mainGraph, greedy);
  const final = trace.steps[trace.steps.length - 1].state;

  it('is fooled by the heuristic: expands S, A, E (h=1 looked most promising) before finding G', () => {
    expect(final.expanded).toEqual(['S', 'A', 'E']);
  });

  it('finds S -> A -> E -> G, cost 14 — NOT the cheapest solution', () => {
    expect(final.status).toBe('solved');
    expect(final.solutionPath).toEqual(['S', 'A', 'E', 'G']);
    expect(final.totalCost).toBe(14);
  });

  it('is NOT optimal on this graph — greedy ignores g(n) entirely and pays for it', () => {
    expect(trace.summary.isOptimal).toBe(false);
    expect(trace.summary.optimalCost).toBe(8);
  });

  it('picks A first because h(A)=3 is lower than h(B)=4 and h(C)=8', () => {
    const afterS = trace.steps.find(
      (s) => s.event.type === 'ADD_TO_FRONTIER' && s.state.expanded.length === 1,
    )!;
    expect(afterS.state.frontier.map((e) => `${e.nodeId}:${e.h}`)).toEqual(['A:3', 'B:4', 'C:8']);
  });

  it('picks E over B/C/D because h(E)=1 is the lowest in the frontier at that point', () => {
    const afterA = trace.steps.find(
      (s) => s.event.type === 'ADD_TO_FRONTIER' && s.state.expanded.length === 2,
    )!;
    expect(afterA.state.frontier.map((e) => `${e.nodeId}:${e.h}`)).toEqual(['E:1', 'B:4', 'C:8', 'D:9']);
  });

  it('discovers B, C, D as siblings but never expands them once G is found via E', () => {
    expect(final.discovered['B']).toBeDefined();
    expect(final.discovered['C']).toBeDefined();
    expect(final.discovered['D']).toBeDefined();
    expect(final.expanded).not.toContain('B');
    expect(final.expanded).not.toContain('C');
    expect(final.expanded).not.toContain('D');
  });
});
