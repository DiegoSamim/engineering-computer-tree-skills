import type { NodeId } from '../domain/types';

/**
 * One frontier entry as tracked by an algorithm — carries every number the
 * UI needs to explain *why* a node was (or wasn't) chosen.
 */
export interface FrontierEntry {
  nodeId: NodeId;
  parentId?: NodeId;
  viaEdge?: string;
  /** Cost accumulated from the start node to this one, g(n). */
  g: number;
  /** Heuristic estimate to the goal, h(n) — only present for informed searches. */
  h?: number;
  /** f(n) = g(n) + h(n) — only present for A* / IDA*. */
  f?: number;
  depth: number;
  /** Full path from start to this node, inclusive. */
  path: NodeId[];
  /**
   * Monotonic discovery order — set only by priority-based searches
   * (UCS/Greedy/A*), used purely to break ties stably (earlier-discovered
   * wins) when two entries share the same priority value.
   */
  seq?: number;
}

/**
 * Why a particular node was picked over the rest of the frontier — the raw
 * material for the "Por que não escolheu X?" interaction. Each variant
 * carries the exact numbers that justify the decision, not just prose.
 */
export type SelectionReason =
  | { kind: 'fifo'; queueBefore: NodeId[] }
  | { kind: 'lifo'; stackBefore: NodeId[] }
  | {
      kind: 'min';
      metric: 'g' | 'h' | 'f';
      chosen: NodeId;
      candidates: { id: NodeId; value: number }[];
    }
  | { kind: 'min-edge-cost'; chosen: NodeId; candidates: { id: NodeId; value: number }[] }
  | { kind: 'first-untried'; remaining: NodeId[] };

export type SkipReason = 'already-visited' | 'worse-path' | 'over-limit' | 'in-current-path' | 'not-chosen';

export interface DiscoveryDescriptor {
  node: NodeId;
  via: string;
  g: number;
  depth: number;
}

/**
 * A single, pedagogically-atomic step of an algorithm's execution. Never
 * bundles more than one *kind* of decision — discovering a batch of sibling
 * successors together is one homogeneous action, so it is one event.
 */
export type StepEvent =
  | { type: 'INIT'; start: NodeId }
  | { type: 'SELECT_NODE'; node: NodeId; reason: SelectionReason }
  | { type: 'GOAL_TEST'; node: NodeId; isGoal: boolean; when: 'generation' | 'expansion' }
  | { type: 'EXPAND_NODE'; node: NodeId; successors: NodeId[] }
  | { type: 'DISCOVER_NODES'; discoveries: DiscoveryDescriptor[] }
  | { type: 'ADD_TO_FRONTIER'; entries: FrontierEntry[] }
  | { type: 'UPDATE_FRONTIER'; entries: FrontierEntry[] }
  | { type: 'SKIP_NODE'; node: NodeId; via: string; reason: SkipReason; f?: number }
  | { type: 'DEAD_END'; node: NodeId }
  | { type: 'BACKTRACK'; from: NodeId; to: NodeId }
  | { type: 'ITERATION_START'; limit: number }
  | { type: 'ITERATION_END'; exhaustedLimit: number; nextLimit: number | null }
  | { type: 'SOLUTION_FOUND'; path: NodeId[]; cost: number }
  | { type: 'FAILURE'; reason: string };
