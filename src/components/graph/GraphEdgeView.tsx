import { motion } from 'framer-motion';
import type { GraphEdge, GraphNode } from '../../domain/types';
import type { EdgeVisualState } from '../../domain/types';
import { EDGE_STYLES } from './visualEncoding';

const NODE_RADIUS = 26;
const ARROW_LEN = 9;

interface Props {
  edge: GraphEdge;
  from: GraphNode;
  to: GraphNode;
  state: EdgeVisualState;
}

export function GraphEdgeView({ edge, from, to, state }: Props) {
  const style = EDGE_STYLES[state];
  const dx = to.x - from.x;
  const dy = to.y - from.y;
  const len = Math.hypot(dx, dy) || 1;
  const ux = dx / len;
  const uy = dy / len;

  const x1 = from.x + ux * NODE_RADIUS;
  const y1 = from.y + uy * NODE_RADIUS;
  const x2 = to.x - ux * (NODE_RADIUS + ARROW_LEN);
  const y2 = to.y - uy * (NODE_RADIUS + ARROW_LEN);

  const midX = (x1 + x2) / 2;
  const midY = (y1 + y2) / 2;
  // Offset the cost label perpendicular to the edge so it never sits on the line.
  const perpX = -uy * 13;
  const perpY = ux * 13;

  return (
    <g>
      <motion.line
        x1={x1}
        y1={y1}
        x2={x2}
        y2={y2}
        initial={false}
        animate={{
          stroke: style.stroke,
          strokeWidth: style.strokeWidth,
          opacity: style.opacity ?? 1,
        }}
        transition={{ duration: 0.35, ease: 'easeInOut' }}
        strokeDasharray={style.dash}
        markerEnd={`url(#arrow-${style.marker})`}
      />
      <g transform={`translate(${midX + perpX}, ${midY + perpY})`}>
        <rect x={-11} y={-9} width={22} height={16} rx={3} fill="var(--bg)" stroke="var(--border)" strokeWidth={1} />
        <text
          textAnchor="middle"
          dominantBaseline="middle"
          y={0.5}
          fontSize={10.5}
          fontFamily="var(--font-mono)"
          fill="var(--text-muted)"
        >
          {edge.cost}
        </text>
      </g>
    </g>
  );
}
