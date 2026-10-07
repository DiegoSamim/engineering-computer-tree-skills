import { useMemo } from 'react';
import type { GraphProblem, NodeId } from '../../domain/types';
import type { SimulationState } from '../../simulation/state';
import { deriveEdgeStates, deriveNodeRoles, deriveNodeStates } from '../../simulation/derive';
import { GraphNodeView } from './GraphNodeView';
import { GraphEdgeView } from './GraphEdgeView';

const PADDING = 70;
const NODE_MARGIN = 30; // extra room for role labels / badges above & below nodes

interface Props {
  problem: GraphProblem;
  state: SimulationState;
  onNodeClick?: (nodeId: NodeId) => void;
}

function ArrowMarker({ id, color }: { id: string; color: string }) {
  return (
    <marker id={id} viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
      <path d="M 0 0 L 10 5 L 0 10 z" fill={color} />
    </marker>
  );
}

export function GraphCanvas({ problem, state, onNodeClick }: Props) {
  const nodeStates = useMemo(() => deriveNodeStates(state, problem), [state, problem]);
  const nodeRoles = useMemo(() => deriveNodeRoles(problem), [problem]);
  const edgeStates = useMemo(() => deriveEdgeStates(state, problem), [state, problem]);

  const frontierByNode = useMemo(() => {
    const map = new Map<NodeId, (typeof state.frontier)[number]>();
    for (const entry of state.frontier) map.set(entry.nodeId, entry);
    return map;
  }, [state.frontier]);

  const nodeById = useMemo(() => new Map(problem.nodes.map((n) => [n.id, n])), [problem.nodes]);

  const viewBox = useMemo(() => {
    const xs = problem.nodes.map((n) => n.x);
    const ys = problem.nodes.map((n) => n.y);
    const minX = Math.min(...xs) - PADDING;
    const minY = Math.min(...ys) - PADDING - NODE_MARGIN;
    const maxX = Math.max(...xs) + PADDING;
    const maxY = Math.max(...ys) + PADDING + NODE_MARGIN;
    return `${minX} ${minY} ${maxX - minX} ${maxY - minY}`;
  }, [problem.nodes]);

  return (
    <svg
      viewBox={viewBox}
      width="100%"
      height="100%"
      preserveAspectRatio="xMidYMid meet"
      role="img"
      aria-label={`Grafo: ${problem.name}`}
    >
      <defs>
        <ArrowMarker id="arrow-default" color="var(--border-strong)" />
        <ArrowMarker id="arrow-accent" color="var(--color-accent)" />
        <ArrowMarker id="arrow-solution" color="var(--color-state-solution)" />
        <ArrowMarker id="arrow-danger" color="var(--color-state-danger)" />
      </defs>

      <g>
        {problem.edges.map((edge) => (
          <GraphEdgeView
            key={edge.id}
            edge={edge}
            from={nodeById.get(edge.from)!}
            to={nodeById.get(edge.to)!}
            state={edgeStates[edge.id] ?? 'default'}
          />
        ))}
      </g>

      <g>
        {problem.nodes.map((node) => (
          <GraphNodeView
            key={node.id}
            node={node}
            state={nodeStates[node.id] ?? 'default'}
            role={nodeRoles[node.id]}
            frontierEntry={frontierByNode.get(node.id)}
            onClick={onNodeClick ? () => onNodeClick(node.id) : undefined}
          />
        ))}
      </g>
    </svg>
  );
}
