/**
 * Core graph domain model. Purely structural — no algorithm state, no visuals.
 */

export type NodeId = string;

export interface GraphNode {
  id: NodeId;
  /** Displayed label; defaults to id when omitted. */
  label?: string;
  /** Position in the graph's own coordinate space (SVG viewBox units). */
  x: number;
  y: number;
  /** Heuristic estimate h(n) to the nearest goal, used by informed search algorithms. */
  heuristic?: number;
  /** Short annotation shown in the UI, e.g. "beco sem saída". */
  note?: string;
}

export interface GraphEdge {
  id: string;
  from: NodeId;
  to: NodeId;
  cost: number;
  directed: boolean;
}

export interface GraphProblem {
  id: string;
  name: string;
  summary: string;
  /** What this graph is designed to teach — shown in the example picker. */
  teachingPoint: string;
  nodes: GraphNode[];
  edges: GraphEdge[];
  start: NodeId;
  goals: NodeId[];
  /**
   * How ties are broken when an algorithm's ordering criterion doesn't fully
   * decide (e.g. equal g/h/f, or FIFO/LIFO order among freshly discovered nodes).
   * 'declaration' means: the order successors were declared in `edges`.
   */
  tieBreak: 'declaration';
}

/**
 * A node's dynamic traversal state at a given simulation step — mutually
 * exclusive, changes as the algorithm runs.
 */
export type NodeVisualState =
  | 'default'
  | 'discovered'
  | 'frontier'
  | 'current'
  | 'expanded'
  | 'solution'
  | 'discarded'
  | 'dead-end'
  | 'backtracking';

/**
 * A node's static role in the problem — independent of traversal state, so a
 * goal node can be simultaneously "current" and "goal" (rendered as an
 * overlay ring/icon rather than replacing the traversal state).
 */
export type NodeRole = 'start' | 'goal' | undefined;

export type EdgeVisualState =
  | 'default'
  | 'current-path'
  | 'solution'
  | 'discarded'
  | 'backtracking';
