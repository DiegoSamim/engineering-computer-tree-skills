import type { GraphProblem } from '../../domain/types';
import { isGoal } from '../../domain/graph';
import type { FrontierEntry, StepEvent } from '../../simulation/events';
import { expandSuccessors, pushToStack, toDiscoveryDescriptors } from '../_shared/frontier';

/**
 * Depth-First Search. LIFO frontier: always explores the most recently
 * discovered node first, diving as deep as possible before trying a
 * sibling. Goal-tested at *expansion* time (when a node is popped), unlike
 * BFS — this is what makes DFS's dead ends and backtracking visible.
 */
export function* run(problem: GraphProblem): Generator<StepEvent> {
  yield { type: 'INIT', start: problem.start };

  const startEntry: FrontierEntry = { nodeId: problem.start, g: 0, depth: 0, path: [problem.start] };
  const discoveredSet = new Set([problem.start]);
  let stack: FrontierEntry[] = [startEntry];
  let currentPath: string[] = [problem.start];

  while (stack.length > 0) {
    const stackBefore = stack.map((e) => e.nodeId);
    const entry = stack[0];
    stack = stack.slice(1);

    // Unwind currentPath back to this entry's parent before selecting it —
    // this is what makes backtracking visible as its own animated step,
    // one hop at a time, rather than silently jumping between branches.
    while (currentPath.length > 1 && currentPath[currentPath.length - 1] !== entry.parentId) {
      const from = currentPath.pop()!;
      const to = currentPath[currentPath.length - 1];
      yield { type: 'BACKTRACK', from, to };
    }

    yield { type: 'SELECT_NODE', node: entry.nodeId, reason: { kind: 'lifo', stackBefore } };
    if (currentPath[currentPath.length - 1] !== entry.nodeId) currentPath.push(entry.nodeId);

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

    const freshEntries: FrontierEntry[] = [];
    for (const successor of successorEntries) {
      if (discoveredSet.has(successor.nodeId)) {
        yield { type: 'SKIP_NODE', node: successor.nodeId, via: successor.viaEdge!, reason: 'already-visited' };
        continue;
      }
      discoveredSet.add(successor.nodeId);
      freshEntries.push(successor);
    }

    if (freshEntries.length === 0) {
      yield { type: 'DEAD_END', node: entry.nodeId };
      continue;
    }

    yield { type: 'DISCOVER_NODES', discoveries: toDiscoveryDescriptors(freshEntries) };
    stack = pushToStack(stack, freshEntries);
    yield { type: 'ADD_TO_FRONTIER', entries: stack };
  }

  yield { type: 'FAILURE', reason: 'A pilha ficou vazia sem encontrar o objetivo.' };
}
