import type { GraphProblem } from '../../domain/types';
import { isGoal } from '../../domain/graph';
import type { StepEvent } from '../../simulation/events';
import type { FrontierEntry } from '../../simulation/events';
import { expandSuccessors, toDiscoveryDescriptors } from '../_shared/frontier';

/**
 * Breadth-First Search. FIFO frontier, goal-tested at *generation* time
 * (as soon as a successor is discovered) — the classic optimization that
 * avoids ever placing a solution node in the queue without noticing it.
 */
export function* run(problem: GraphProblem): Generator<StepEvent> {
  yield { type: 'INIT', start: problem.start };

  const startEntry: FrontierEntry = { nodeId: problem.start, g: 0, depth: 0, path: [problem.start] };
  const discoveredSet = new Set([problem.start]);

  if (isGoal(problem, problem.start)) {
    yield { type: 'GOAL_TEST', node: problem.start, isGoal: true, when: 'generation' };
    yield { type: 'SOLUTION_FOUND', path: [problem.start], cost: 0 };
    return;
  }

  let queue: FrontierEntry[] = [startEntry];

  while (queue.length > 0) {
    const queueBefore = queue.map((e) => e.nodeId);
    const entry = queue[0];
    queue = queue.slice(1);

    yield { type: 'SELECT_NODE', node: entry.nodeId, reason: { kind: 'fifo', queueBefore } };

    const successorEntries = expandSuccessors(problem, entry);
    yield {
      type: 'EXPAND_NODE',
      node: entry.nodeId,
      successors: successorEntries.map((e) => e.nodeId),
    };

    const freshEntries: FrontierEntry[] = [];
    for (const successor of successorEntries) {
      if (discoveredSet.has(successor.nodeId)) {
        yield { type: 'SKIP_NODE', node: successor.nodeId, via: successor.viaEdge!, reason: 'already-visited' };
        continue;
      }
      discoveredSet.add(successor.nodeId);
      freshEntries.push(successor);
    }

    if (freshEntries.length === 0) continue;

    yield { type: 'DISCOVER_NODES', discoveries: toDiscoveryDescriptors(freshEntries) };
    queue = [...queue, ...freshEntries];
    yield { type: 'ADD_TO_FRONTIER', entries: queue };

    const goalEntry = freshEntries.find((e) => isGoal(problem, e.nodeId));
    if (goalEntry) {
      yield { type: 'GOAL_TEST', node: goalEntry.nodeId, isGoal: true, when: 'generation' };
      yield { type: 'SOLUTION_FOUND', path: goalEntry.path, cost: goalEntry.g };
      return;
    }
  }

  yield { type: 'FAILURE', reason: 'A fronteira ficou vazia sem encontrar o objetivo.' };
}
