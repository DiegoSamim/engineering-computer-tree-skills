import type { GraphProblem, NodeId } from '../../domain/types';
import { isGoal } from '../../domain/graph';
import type { FrontierEntry, StepEvent } from '../../simulation/events';
import { expandSuccessors, toDiscoveryDescriptors } from '../_shared/frontier';

/**
 * Backtracking. Structurally a recursive DFS, but deliberately visualized
 * differently: instead of a global LIFO stack holding every discovered,
 * not-yet-explored node from every branch at once, the frontier here only
 * ever shows the *untried alternatives at the current decision point* —
 * the same thing a human solving this by hand would see. This is the
 * concrete difference from `dfs/run.ts`, not just a naming change.
 */
export function* run(problem: GraphProblem): Generator<StepEvent> {
  yield { type: 'INIT', start: problem.start };

  const startEntry: FrontierEntry = { nodeId: problem.start, g: 0, depth: 0, path: [problem.start] };
  const found = yield* tryFrom(problem, startEntry, [startEntry.nodeId], new Set([problem.start]));

  if (!found) {
    yield { type: 'FAILURE', reason: 'Todas as alternativas foram tentadas e desfeitas — nenhuma leva ao objetivo.' };
  }
}

/**
 * Tries `entry` as the next step of the current decision path. `remaining`
 * is the full list of untried alternatives at this decision point,
 * including `entry` itself (first) — the raw material for the "why not
 * this one instead?" narration and interaction. Returns whether this
 * choice (or one of its descendants) reached the goal.
 */
function* tryFrom(
  problem: GraphProblem,
  entry: FrontierEntry,
  remaining: NodeId[],
  ancestry: Set<NodeId>,
): Generator<StepEvent, boolean> {
  yield { type: 'SELECT_NODE', node: entry.nodeId, reason: { kind: 'first-untried', remaining } };

  const goal = isGoal(problem, entry.nodeId);
  yield { type: 'GOAL_TEST', node: entry.nodeId, isGoal: goal, when: 'expansion' };
  if (goal) {
    yield { type: 'SOLUTION_FOUND', path: entry.path, cost: entry.g };
    return true;
  }

  const successorEntries = expandSuccessors(problem, entry);
  yield {
    type: 'EXPAND_NODE',
    node: entry.nodeId,
    successors: successorEntries.map((e) => e.nodeId),
  };

  const valid: FrontierEntry[] = [];
  for (const s of successorEntries) {
    if (ancestry.has(s.nodeId)) {
      yield { type: 'SKIP_NODE', node: s.nodeId, via: s.viaEdge!, reason: 'in-current-path' };
    } else {
      valid.push(s);
    }
  }

  if (valid.length === 0) {
    yield { type: 'DEAD_END', node: entry.nodeId };
    return false;
  }

  yield { type: 'DISCOVER_NODES', discoveries: toDiscoveryDescriptors(valid) };

  const nextAncestry = new Set(ancestry);
  nextAncestry.add(entry.nodeId);

  for (let i = 0; i < valid.length; i++) {
    const remainingHere = valid.slice(i).map((e) => e.nodeId);
    yield { type: 'ADD_TO_FRONTIER', entries: valid.slice(i) };

    const success = yield* tryFrom(problem, valid[i], remainingHere, nextAncestry);
    if (success) return true;

    yield { type: 'BACKTRACK', from: valid[i].nodeId, to: entry.nodeId };
  }

  return false;
}
