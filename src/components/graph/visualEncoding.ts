import type { EdgeVisualState, NodeVisualState } from '../../domain/types';

export interface NodeStyle {
  stroke: string;
  strokeWidth: number;
  dash?: string;
  fill: string;
  textColor: string;
  glyph?: string;
  opacity?: number;
}

/**
 * One entry per dynamic node state. Every state differs by at least stroke
 * width or dash pattern or glyph — never color alone — so the graph reads
 * correctly even without color vision.
 */
export const NODE_STYLES: Record<NodeVisualState, NodeStyle> = {
  default: {
    stroke: 'var(--border-strong)',
    strokeWidth: 1.5,
    fill: 'var(--bg-raised)',
    textColor: 'var(--text)',
  },
  discovered: {
    stroke: 'var(--color-state-frontier)',
    strokeWidth: 1.5,
    dash: '3 3',
    fill: 'var(--bg-raised)',
    textColor: 'var(--text)',
  },
  frontier: {
    stroke: 'var(--color-state-frontier)',
    strokeWidth: 2.25,
    fill: 'color-mix(in srgb, var(--color-state-frontier) 12%, var(--bg-raised))',
    textColor: 'var(--text)',
  },
  current: {
    stroke: 'var(--color-accent)',
    strokeWidth: 3,
    fill: 'var(--color-accent-soft)',
    textColor: 'var(--color-accent-strong)',
  },
  expanded: {
    stroke: 'var(--color-state-expanded)',
    strokeWidth: 2,
    fill: 'var(--bg-sunken)',
    textColor: 'var(--text)',
    glyph: '✓',
  },
  solution: {
    stroke: 'var(--color-state-solution)',
    strokeWidth: 3.25,
    fill: 'color-mix(in srgb, var(--color-state-solution) 16%, var(--bg-raised))',
    textColor: 'var(--color-state-solution)',
  },
  discarded: {
    stroke: 'var(--color-state-discarded)',
    strokeWidth: 1.5,
    dash: '2 3',
    fill: 'var(--bg-sunken)',
    textColor: 'var(--text-faint)',
    opacity: 0.55,
  },
  'dead-end': {
    stroke: 'var(--color-state-danger)',
    strokeWidth: 2,
    dash: '5 3',
    fill: 'var(--bg-sunken)',
    textColor: 'var(--color-state-danger)',
    glyph: '✕',
  },
  backtracking: {
    stroke: 'var(--color-state-danger)',
    strokeWidth: 2.75,
    fill: 'color-mix(in srgb, var(--color-state-danger) 14%, var(--bg-raised))',
    textColor: 'var(--color-state-danger)',
    glyph: '↺',
  },
};

export interface EdgeStyle {
  stroke: string;
  strokeWidth: number;
  dash?: string;
  opacity?: number;
  marker: 'default' | 'accent' | 'solution' | 'danger';
}

export const EDGE_STYLES: Record<EdgeVisualState, EdgeStyle> = {
  default: { stroke: 'var(--border-strong)', strokeWidth: 1.5, marker: 'default' },
  'current-path': { stroke: 'var(--color-accent)', strokeWidth: 2.5, marker: 'accent' },
  solution: { stroke: 'var(--color-state-solution)', strokeWidth: 3.5, marker: 'solution' },
  discarded: { stroke: 'var(--color-state-discarded)', strokeWidth: 1.5, dash: '2 4', opacity: 0.45, marker: 'default' },
  backtracking: { stroke: 'var(--color-state-danger)', strokeWidth: 2.75, dash: '6 3', marker: 'danger' },
};

export const ROLE_GLYPH: Record<'start' | 'goal', string> = {
  start: '▶',
  goal: '◎',
};
