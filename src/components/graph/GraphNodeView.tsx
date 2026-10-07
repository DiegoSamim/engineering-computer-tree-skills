import { motion, AnimatePresence } from 'framer-motion';
import type { GraphNode, NodeRole, NodeVisualState } from '../../domain/types';
import type { FrontierEntry } from '../../simulation/events';
import { NODE_STYLES, ROLE_GLYPH } from './visualEncoding';

const RADIUS = 26;

interface Props {
  node: GraphNode;
  state: NodeVisualState;
  role: NodeRole;
  frontierEntry?: FrontierEntry;
  onClick?: () => void;
}

function frontierBadgeText(entry: FrontierEntry): string {
  const parts: string[] = [`g=${entry.g}`];
  if (entry.h !== undefined) parts.push(`h=${entry.h}`);
  if (entry.f !== undefined) parts.push(`f=${entry.f}`);
  return parts.join(' ');
}

export function GraphNodeView({ node, state, role, frontierEntry, onClick }: Props) {
  const style = NODE_STYLES[state];

  return (
    <g
      className="ge-node-group"
      data-clickable={onClick ? 'true' : 'false'}
      transform={`translate(${node.x}, ${node.y})`}
      onClick={onClick}
    >
      {role && (
        <circle
          r={RADIUS + 6}
          fill="none"
          stroke="var(--text-faint)"
          strokeWidth={1}
          strokeDasharray="1 4"
          opacity={0.7}
        />
      )}

      <AnimatePresence>
        {state === 'current' && (
          <motion.circle
            key="pulse"
            r={RADIUS}
            fill="none"
            stroke="var(--color-accent)"
            strokeWidth={2}
            initial={{ scale: 1, opacity: 0.6 }}
            animate={{ scale: 1.35, opacity: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.1, repeat: Infinity, ease: 'easeOut' }}
          />
        )}
      </AnimatePresence>

      <circle
        className="ge-node-circle"
        r={RADIUS}
        style={{
          fill: style.fill,
          stroke: style.stroke,
          strokeWidth: style.strokeWidth,
          opacity: style.opacity ?? 1,
        }}
        strokeDasharray={style.dash}
      />

      <text
        textAnchor="middle"
        dominantBaseline="middle"
        y={1}
        fontSize={15}
        fontWeight={600}
        fill={style.textColor}
        style={{ transition: 'fill 320ms ease' }}
      >
        {node.label ?? node.id}
      </text>

      {style.glyph && (
        <text x={RADIUS - 6} y={-RADIUS + 8} textAnchor="middle" fontSize={12} fill={style.stroke}>
          {style.glyph}
        </text>
      )}

      {role && (
        <text
          x={0}
          y={-RADIUS - 12}
          textAnchor="middle"
          fontSize={10}
          letterSpacing={0.4}
          fill="var(--text-faint)"
          style={{ textTransform: 'uppercase' }}
        >
          {role === 'start' ? `${ROLE_GLYPH.start} início` : `${ROLE_GLYPH.goal} objetivo`}
        </text>
      )}

      {frontierEntry && (
        <g transform={`translate(0, ${RADIUS + 16})`}>
          <text
            textAnchor="middle"
            fontSize={9.5}
            fontFamily="var(--font-mono)"
            fill="var(--color-state-frontier)"
          >
            {frontierBadgeText(frontierEntry)}
          </text>
        </g>
      )}

      {node.note && (
        <text
          x={0}
          y={RADIUS + (frontierEntry ? 30 : 16)}
          textAnchor="middle"
          fontSize={9.5}
          fill="var(--color-state-danger)"
        >
          {node.note}
        </text>
      )}
    </g>
  );
}
