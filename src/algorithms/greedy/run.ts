import type { GraphProblem } from '../../domain/types';
import { heuristicOf, isGoal } from '../../domain/graph';
import type { FrontierEntry, StepEvent } from '../../simulation/events';
import { createSequencer, expandSuccessors, sortByPriority, toDiscoveryDescriptors } from '../_shared/frontier';

const keyOf = (e: FrontierEntry) => e.h ?? 0;

/**
 * Greedy Best-First Search. Priority queue ordered only by h(n), the
 * heuristic estimate of what's left — g(n) is tracked (for display) but
 * never influences the choice. Unlike UCS, a node's h(n) never changes no
 * matter which path reaches it, so a rediscovered node is simply skipped,
 * never re-prioritized.
 */
export function* run(problem: GraphProblem): Generator<StepEvent> {
  yield { type: 'INIT', start: problem.start };

  const seq = createSequencer();
  const discovered = new Set([problem.start]);
  let frontier: FrontierEntry[] = [
    { nodeId: problem.start, g: 0, h: heuristicOf(problem, problem.start), depth: 0, path: [problem.start], seq: seq() },
  ];

  while (frontier.length > 0) {
    const candidates = frontier.map((e) => ({ id: e.nodeId, value: e.h ?? 0 }));
    const entry = frontier[0];
    frontier = frontier.slice(1);

    yield { type: 'SELECT_NODE', node: entry.nodeId, reason: { kind: 'min', metric: 'h', chosen: entry.nodeId, candidates } };

    const goal = isGoal(problem, entry.nodeId);
    yield { type: 'GOAL_TEST', node: entry.nodeId, isGoal: goal, when: 'expansion' };
    if (goal) {
      yield { type: 'SOLUTION_FOUND', path: entry.path, cost: entry.g };
      return;
    }

    const successorEntries = expandSuccessors(problem, entry).map((e) => ({
      ...e,
      h: heuristicOf(problem, e.nodeId),
      seq: seq(),
    }));
    yield {
      type: 'EXPAND_NODE',
      node: entry.nodeId,
      successors: successorEntries.map((e) => e.nodeId),
    };

    if (successorEntries.length === 0) {
      yield { type: 'DEAD_END', node: entry.nodeId };
      continue;
    }

    const fresh: FrontierEntry[] = [];
    for (const s of successorEntries) {
      if (discovered.has(s.nodeId)) {
        yield { type: 'SKIP_NODE', node: s.nodeId, via: s.viaEdge!, reason: 'already-visited' };
      } else {
        discovered.add(s.nodeId);
        fresh.push(s);
      }
    }

    if (fresh.length === 0) continue;

    yield { type: 'DISCOVER_NODES', discoveries: toDiscoveryDescriptors(fresh) };
    frontier = sortByPriority([...frontier, ...fresh], keyOf);
    yield { type: 'ADD_TO_FRONTIER', entries: frontier };
  }

  yield { type: 'FAILURE', reason: 'A fronteira ficou vazia sem encontrar o objetivo.' };
}
