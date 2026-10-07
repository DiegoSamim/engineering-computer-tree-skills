import type { GraphEdge, GraphProblem, NodeId } from './types';

/**
 * Adjacency list keyed by source node, edges kept in declaration order —
 * this order is what "tieBreak: declaration" means throughout the app.
 */
export type Adjacency = Map<NodeId, GraphEdge[]>;

export function buildAdjacency(problem: GraphProblem): Adjacency {
  const adjacency: Adjacency = new Map();
  for (const node of problem.nodes) {
    adjacency.set(node.id, []);
  }
  for (const edge of problem.edges) {
    adjacency.get(edge.from)?.push(edge);
    if (!edge.directed) {
      adjacency.get(edge.to)?.push({
        id: `${edge.to}->${edge.from}`,
        from: edge.to,
        to: edge.from,
        cost: edge.cost,
        directed: false,
      });
    }
  }
  return adjacency;
}

/** Outgoing edges of `node`, in declaration order. */
export function successorsOf(problem: GraphProblem, node: NodeId): GraphEdge[] {
  return problem.edges.filter((edge) => edge.from === node);
}

export function edgeBetween(
  problem: GraphProblem,
  from: NodeId,
  to: NodeId,
): GraphEdge | undefined {
  return problem.edges.find((edge) => edge.from === from && edge.to === to);
}

export function getNode(problem: GraphProblem, id: NodeId) {
  const node = problem.nodes.find((n) => n.id === id);
  if (!node) throw new Error(`Unknown node "${id}" in graph "${problem.id}"`);
  return node;
}

export function nodeLabel(problem: GraphProblem, id: NodeId): string {
  return getNode(problem, id).label ?? id;
}

export function isGoal(problem: GraphProblem, id: NodeId): boolean {
  return problem.goals.includes(id);
}

/** Total cost of walking a path of node ids in order, following declared edges. */
export function pathCost(problem: GraphProblem, path: NodeId[]): number {
  let total = 0;
  for (let i = 0; i < path.length - 1; i++) {
    const edge = edgeBetween(problem, path[i], path[i + 1]);
    if (!edge) {
      throw new Error(`No edge from "${path[i]}" to "${path[i + 1]}" in graph "${problem.id}"`);
    }
    total += edge.cost;
  }
  return total;
}

export function heuristicOf(problem: GraphProblem, id: NodeId): number {
  return getNode(problem, id).heuristic ?? 0;
}

/**
 * Ground-truth shortest-path costs from `problem.start`, via a plain
 * Dijkstra over the declared edges. Used to answer "was this solution
 * optimal?" generically, for any graph — not hardcoded to a specific one.
 */
export function shortestCostsFromStart(problem: GraphProblem): Map<NodeId, number> {
  const adjacency = buildAdjacency(problem);
  const dist = new Map<NodeId, number>();
  const visited = new Set<NodeId>();
  dist.set(problem.start, 0);

  while (true) {
    let currentId: NodeId | undefined;
    let currentDist = Infinity;
    for (const [id, d] of dist) {
      if (!visited.has(id) && d < currentDist) {
        currentDist = d;
        currentId = id;
      }
    }
    if (currentId === undefined) break;
    visited.add(currentId);

    for (const edge of adjacency.get(currentId) ?? []) {
      const candidate = currentDist + edge.cost;
      if (candidate < (dist.get(edge.to) ?? Infinity)) {
        dist.set(edge.to, candidate);
      }
    }
  }

  return dist;
}

/** The cost of the cheapest path from start to any goal, or undefined if unreachable. */
export function optimalSolutionCost(problem: GraphProblem): number | undefined {
  const dist = shortestCostsFromStart(problem);
  let best: number | undefined;
  for (const goal of problem.goals) {
    const d = dist.get(goal);
    if (d !== undefined && (best === undefined || d < best)) best = d;
  }
  return best;
}
