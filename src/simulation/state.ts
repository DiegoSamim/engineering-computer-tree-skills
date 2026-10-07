import type { NodeId } from '../domain/types';
import type { FrontierEntry } from './events';

export type FrontierKind = 'queue' | 'stack' | 'priority' | 'path' | 'decision-point' | 'iterative-deepening';

export interface DiscoveryInfo {
  g: number;
  depth: number;
  parent?: NodeId;
  via?: string;
}

export interface SimulationMetrics {
  discovered: number;
  expanded: number;
  frontierSize: number;
  maxFrontierSize: number;
}

/**
 * A complete, immutable snapshot of the algorithm's internal state at one
 * step. The UI is a pure function of this object — nothing else is needed
 * to render a step, and nothing here is ever mutated in place.
 */
export interface SimulationState {
  step: number;
  currentNode?: NodeId;
  frontier: FrontierEntry[];
  frontierKind: FrontierKind;
  discovered: Record<NodeId, DiscoveryInfo>;
  expanded: NodeId[];
  currentPath: NodeId[];
  solutionPath?: NodeId[];
  discardedEdges: string[];
  /** Nodes explicitly abandoned by a BACKTRACK event (DFS/backtracking only). */
  discardedNodes: NodeId[];
  deadEnds: NodeId[];
  /** Set only on the exact step a BACKTRACK fires — transient, for the "undo" animation. */
  backtrackingEdge?: string;
  backtrackingFrom?: NodeId;
  status: 'running' | 'solved' | 'failed';
  totalCost: number;
  depth: number;
  metrics: SimulationMetrics;
  /** Algorithm-specific extras that don't fit the common shape (IDA* limit, etc). */
  extra?: {
    /** Limite de f(n) da iteração corrente (IDA*). */
    limit?: number;
    /** Nós podados nesta iteração, com o f que estourou o limite. */
    overLimitNodes?: { node: NodeId; f: number }[];
    /** Menor f que ultrapassou o limite — vira o limite da próxima iteração. */
    nextLimit?: number;
  };
}

export function createInitialState(frontierKind: FrontierKind): SimulationState {
  return {
    step: 0,
    currentNode: undefined,
    frontier: [],
    frontierKind,
    discovered: {},
    expanded: [],
    currentPath: [],
    solutionPath: undefined,
    discardedEdges: [],
    discardedNodes: [],
    deadEnds: [],
    backtrackingEdge: undefined,
    backtrackingFrom: undefined,
    status: 'running',
    totalCost: 0,
    depth: 0,
    metrics: { discovered: 0, expanded: 0, frontierSize: 0, maxFrontierSize: 0 },
    extra: undefined,
  };
}
