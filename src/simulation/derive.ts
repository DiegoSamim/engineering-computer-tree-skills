import type { GraphProblem, NodeId, NodeRole, NodeVisualState, EdgeVisualState } from '../domain/types';
import type { SimulationState } from './state';

/**
 * Turns a SimulationState into what the graph should look like. This is the
 * ONLY place that decides node/edge visual states — every renderer (the
 * main view, the compare view) calls this instead of re-deriving anything
 * itself, so the two never drift apart.
 */
export function deriveNodeStates(
  state: SimulationState,
  problem: GraphProblem,
): Record<NodeId, NodeVisualState> {
  const result: Record<NodeId, NodeVisualState> = {};
  const frontierIds = new Set(state.frontier.map((e) => e.nodeId));

  for (const node of problem.nodes) {
    const id = node.id;
    if (state.deadEnds.includes(id)) {
      result[id] = 'dead-end';
    } else if (id === state.backtrackingFrom) {
      // Transient: only true on the exact step the BACKTRACK event fires —
      // this is the "undo" pulse before the node settles into 'discarded'.
      result[id] = 'backtracking';
    } else if (state.discardedNodes.includes(id)) {
      result[id] = 'discarded';
    } else if (state.solutionPath?.includes(id)) {
      result[id] = 'solution';
    } else if (id === state.currentNode) {
      result[id] = 'current';
    } else if (state.expanded.includes(id)) {
      result[id] = 'expanded';
    } else if (frontierIds.has(id)) {
      result[id] = 'frontier';
    } else if (state.discovered[id]) {
      result[id] = 'discovered';
    } else {
      result[id] = 'default';
    }
  }

  return result;
}

export function deriveNodeRoles(problem: GraphProblem): Record<NodeId, NodeRole> {
  const result: Record<NodeId, NodeRole> = {};
  for (const node of problem.nodes) {
    if (node.id === problem.start) result[node.id] = 'start';
    else if (problem.goals.includes(node.id)) result[node.id] = 'goal';
    else result[node.id] = undefined;
  }
  return result;
}

function pathEdgeIds(problem: GraphProblem, path: NodeId[]): Set<string> {
  const ids = new Set<string>();
  for (let i = 0; i < path.length - 1; i++) {
    const edge = problem.edges.find((e) => e.from === path[i] && e.to === path[i + 1]);
    if (edge) ids.add(edge.id);
  }
  return ids;
}

export function deriveEdgeStates(
  state: SimulationState,
  problem: GraphProblem,
): Record<string, EdgeVisualState> {
  const result: Record<string, EdgeVisualState> = {};
  const solutionEdges = state.solutionPath ? pathEdgeIds(problem, state.solutionPath) : new Set<string>();
  const currentPathEdges = pathEdgeIds(problem, state.currentPath);
  const discarded = new Set(state.discardedEdges);

  for (const edge of problem.edges) {
    if (solutionEdges.has(edge.id)) {
      result[edge.id] = 'solution';
    } else if (edge.id === state.backtrackingEdge) {
      result[edge.id] = 'backtracking';
    } else if (currentPathEdges.has(edge.id)) {
      result[edge.id] = 'current-path';
    } else if (discarded.has(edge.id)) {
      result[edge.id] = 'discarded';
    } else {
      result[edge.id] = 'default';
    }
  }

  return result;
}
