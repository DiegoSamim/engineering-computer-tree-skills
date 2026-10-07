import type { GraphProblem } from '../../domain/types';
import { isGoal } from '../../domain/graph';
import type { FrontierEntry, StepEvent } from '../../simulation/events';
import { expandSuccessors, toDiscoveryDescriptors } from '../_shared/frontier';

/**
 * Irrevocable search. At every step, commits to the successor with the
 * cheapest *immediate* edge cost and never looks back — there is no
 * frontier, no memory of alternatives, no backtracking. If that greedy,
 * myopic commitment ever dead-ends, the search simply fails, even when a
 * solution exists elsewhere in the graph.
 */
export function* run(problem: GraphProblem): Generator<StepEvent> {
  yield { type: 'INIT', start: problem.start };
  // This search keeps no frontier at all — clear the one INIT seeded, and
  // it stays empty for the whole run: there is never a waiting list.
  yield { type: 'ADD_TO_FRONTIER', entries: [] };

  let entry: FrontierEntry = { nodeId: problem.start, g: 0, depth: 0, path: [problem.start] };

  while (true) {
    yield {
      type: 'SELECT_NODE',
      node: entry.nodeId,
      reason: { kind: 'min-edge-cost', chosen: entry.nodeId, candidates: [] },
    };

    const goal = isGoal(problem, entry.nodeId);
    yield { type: 'GOAL_TEST', node: entry.nodeId, isGoal: goal, when: 'expansion' };
    if (goal) {
      yield { type: 'SOLUTION_FOUND', path: entry.path, cost: entry.g };
      return;
    }

    const successorEntries = expandSuccessors(problem, entry);
    yield {
      type: 'EXPAND_NODE',
      node: entry.nodeId,
      successors: successorEntries.map((e) => e.nodeId),
    };

    if (successorEntries.length === 0) {
      yield { type: 'DEAD_END', node: entry.nodeId };
      yield {
        type: 'FAILURE',
        reason: `${entry.nodeId} não tem sucessores e esta busca nunca reconsidera uma escolha anterior — não há como voltar.`,
      };
      return;
    }

    yield { type: 'DISCOVER_NODES', discoveries: toDiscoveryDescriptors(successorEntries) };

    let best = successorEntries[0];
    for (const s of successorEntries) {
      if (s.g - entry.g < best.g - entry.g) best = s;
    }

    for (const s of successorEntries) {
      if (s.nodeId !== best.nodeId) {
        yield { type: 'SKIP_NODE', node: s.nodeId, via: s.viaEdge!, reason: 'not-chosen' };
      }
    }

    entry = best;
  }
}
