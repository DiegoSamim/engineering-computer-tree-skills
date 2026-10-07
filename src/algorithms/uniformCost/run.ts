import type { GraphProblem, NodeId } from '../../domain/types';
import { isGoal } from '../../domain/graph';
import type { FrontierEntry, StepEvent } from '../../simulation/events';
import { createSequencer, expandSuccessors, sortByPriority, toDiscoveryDescriptors } from '../_shared/frontier';

const keyOf = (e: FrontierEntry) => e.g;

/**
 * Uniform-Cost Search. Priority queue ordered by g(n), the cost accumulated
 * since the start — not by depth, not by any estimate of what's left.
 * Goal-tested at *expansion* (when popped), not at generation like BFS:
 * that is what lets it correct course when a cheaper path to an
 * already-discovered node turns up later (the E/F/G decrease-key below).
 */
export function* run(problem: GraphProblem): Generator<StepEvent> {
  yield { type: 'INIT', start: problem.start };

  const seq = createSequencer();
  const bestG = new Map<NodeId, number>([[problem.start, 0]]);
  let frontier: FrontierEntry[] = [{ nodeId: problem.start, g: 0, depth: 0, path: [problem.start], seq: seq() }];

  while (frontier.length > 0) {
    const candidates = frontier.map((e) => ({ id: e.nodeId, value: e.g }));
    const entry = frontier[0];
    frontier = frontier.slice(1);

    yield { type: 'SELECT_NODE', node: entry.nodeId, reason: { kind: 'min', metric: 'g', chosen: entry.nodeId, candidates } };

    const goal = isGoal(problem, entry.nodeId);
    yield { type: 'GOAL_TEST', node: entry.nodeId, isGoal: goal, when: 'expansion' };
    if (goal) {
      yield { type: 'SOLUTION_FOUND', path: entry.path, cost: entry.g };
      return;
    }

    const successorEntries = expandSuccessors(problem, entry).map((e) => ({ ...e, seq: seq() }));
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
    const improved: FrontierEntry[] = [];
    for (const s of successorEntries) {
      const known = bestG.get(s.nodeId);
      if (known === undefined) {
        bestG.set(s.nodeId, s.g);
        fresh.push(s);
      } else if (s.g < known) {
        bestG.set(s.nodeId, s.g);
        improved.push(s);
      } else {
        yield { type: 'SKIP_NODE', node: s.nodeId, via: s.viaEdge!, reason: 'worse-path' };
      }
    }

    if (fresh.length > 0) {
      yield { type: 'DISCOVER_NODES', discoveries: toDiscoveryDescriptors(fresh) };
      frontier = sortByPriority([...frontier, ...fresh], keyOf);
      yield { type: 'ADD_TO_FRONTIER', entries: frontier };
    }

    if (improved.length > 0) {
      const improvedIds = new Set(improved.map((e) => e.nodeId));
      frontier = sortByPriority([...frontier.filter((e) => !improvedIds.has(e.nodeId)), ...improved], keyOf);
      yield { type: 'UPDATE_FRONTIER', entries: frontier };
    }
  }

  yield { type: 'FAILURE', reason: 'A fronteira ficou vazia sem encontrar o objetivo.' };
}
