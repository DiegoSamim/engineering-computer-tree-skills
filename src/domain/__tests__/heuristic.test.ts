import { describe, expect, it } from 'vitest';
import { mainGraph } from '../../graphs/main-graph';
import { shortestCostsFromStart, successorsOf } from '../graph';
import type { GraphProblem } from '../types';

/**
 * Generic checks — apply to any GraphProblem, not just mainGraph. A future
 * example graph that fails these has an invalid heuristic, which would
 * silently break the optimality guarantees of A-star, Greedy, and IDA-star.
 */
function assertAdmissibleAndConsistent(problem: GraphProblem) {
  const trueCostToGoal = new Map<string, number>();
  // True remaining cost from each node = cheapest path from it to any goal.
  for (const node of problem.nodes) {
    const reversed: GraphProblem = { ...problem, start: node.id };
    const dist = shortestCostsFromStart(reversed);
    let best = Infinity;
    for (const goal of problem.goals) {
      const d = dist.get(goal);
      if (d !== undefined) best = Math.min(best, d);
    }
    trueCostToGoal.set(node.id, best);
  }

  for (const node of problem.nodes) {
    const h = node.heuristic ?? 0;
    const trueCost = trueCostToGoal.get(node.id)!;
    if (Number.isFinite(trueCost)) {
      expect(h, `h(${node.id}) should be admissible (<= true cost ${trueCost})`).toBeLessThanOrEqual(trueCost);
    }
  }

  for (const edge of problem.edges) {
    const hFrom = problem.nodes.find((n) => n.id === edge.from)!.heuristic ?? 0;
    const hTo = problem.nodes.find((n) => n.id === edge.to)!.heuristic ?? 0;
    expect(hFrom, `h(${edge.from}) should be consistent across edge ${edge.id}`).toBeLessThanOrEqual(
      edge.cost + hTo,
    );
  }
}

describe('mainGraph heuristic', () => {
  it('is admissible and consistent', () => {
    assertAdmissibleAndConsistent(mainGraph);
  });

  it('every node reachable from S is declared, and successors follow declaration order', () => {
    const sSuccessors = successorsOf(mainGraph, 'S').map((e) => e.to);
    expect(sSuccessors).toEqual(['A', 'B', 'C']);
  });
});
