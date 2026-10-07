import type { GraphProblem, NodeId } from '../../domain/types';
import { successorsOf } from '../../domain/graph';
import type { DiscoveryDescriptor, FrontierEntry } from '../../simulation/events';

/**
 * Successors of `parent`, in declaration order, each carrying the numbers a
 * simple uninformed search needs (g = accumulated cost, depth, full path).
 * Shared by BFS and DFS; informed searches (UCS, Greedy, A-star, IDA-star) layer their
 * own priority (h, f) on top of the same underlying edge walk.
 */
export function expandSuccessors(problem: GraphProblem, parent: FrontierEntry): FrontierEntry[] {
  return successorsOf(problem, parent.nodeId).map((edge) => ({
    nodeId: edge.to,
    parentId: parent.nodeId,
    viaEdge: edge.id,
    g: parent.g + edge.cost,
    depth: parent.depth + 1,
    path: [...parent.path, edge.to],
  }));
}

export function toDiscoveryDescriptors(entries: FrontierEntry[]): DiscoveryDescriptor[] {
  return entries.map((e) => ({
    node: e.nodeId,
    via: e.viaEdge!,
    g: e.g,
    depth: e.depth,
  }));
}

/** Human-readable frontier contents, e.g. "[A, B, C]" — for narration text. */
export function frontierLabel(ids: NodeId[]): string {
  return `[${ids.join(', ')}]`;
}

/**
 * Pushes a batch of freshly-discovered entries onto a stack whose "top"
 * (next to pop) is always index 0. Prepending preserves declaration order
 * within the batch, so the first-declared successor ends up on top — the
 * same node a recursive DFS would visit first.
 */
export function pushToStack(stack: FrontierEntry[], newEntries: FrontierEntry[]): FrontierEntry[] {
  return [...newEntries, ...stack];
}

/**
 * A simple monotonic counter for stamping `FrontierEntry.seq` — priority
 * searches use it to break ties between equal-priority entries by who was
 * discovered first, which is what makes their frontier order deterministic
 * and explainable (not just "whatever the sort algorithm happened to do").
 */
export function createSequencer(): () => number {
  let next = 0;
  return () => next++;
}

/**
 * Stable-sorts a priority frontier ascending by `keyOf`, ties broken by
 * discovery order (`entry.seq`, earlier first). Shared by UCS, Greedy, and
 * (later) A-star/IDA-star — the only thing that differs between them is `keyOf`.
 */
export function sortByPriority(entries: FrontierEntry[], keyOf: (e: FrontierEntry) => number): FrontierEntry[] {
  return [...entries].sort((a, b) => keyOf(a) - keyOf(b) || (a.seq ?? 0) - (b.seq ?? 0));
}
