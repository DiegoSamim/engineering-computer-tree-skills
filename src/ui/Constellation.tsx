import type { CSSProperties, KeyboardEvent } from 'react';
import { SKY_H, SKY_W, px, py, type ConstellationView, type StarView } from '../store/views';
import { STATE_LABEL } from './labels';

interface Props {
  view: ConstellationView;
  /** Nome da branch, para leitores de tela. */
  label: string;
  /** Constelação expandida: rótulos, seleção, teclado e linhas se desenhando. */
  big?: boolean;
  selected?: string | null;
  onSelect?: (slug: string) => void;
  onOpen?: (slug: string) => void;
}

const cssVars = (vars: Record<string, string | number>) => vars as CSSProperties;

/**
 * Uma branch como constelação: SVG feito à mão, como no protótipo. As linhas
 * são requisitos (acesa = cumprido, tracejada = alternativa OU). As estrelas
 * são StarNodes; a forma diz o estado sem precisar de texto.
 */
export function Constellation({ view, label, big = false, selected = null, onSelect, onOpen }: Props) {
  if (view.stars.length === 0) {
    return (
      <svg className="constellation" viewBox={`0 0 ${SKY_W} ${SKY_H}`} role="img" aria-label={`${label}: nenhum nó ainda`}>
        <g className="empty-stars">
          <circle cx={px(0.5)} cy={py(0.5)} r={7} />
          <circle cx={px(0.35)} cy={py(0.3)} r={4} />
          <circle cx={px(0.68)} cy={py(0.66)} r={4} />
        </g>
      </svg>
    );
  }

  return (
    <svg
      className={`constellation ${big ? 'big' : ''} ${big && selected ? 'focus' : ''}`}
      viewBox={`0 0 ${SKY_W} ${SKY_H}`}
      role={big ? 'group' : 'img'}
      aria-label={`Constelação ${label}`}
    >
      {view.edges.map((e, i) => {
        const rel = selected !== null && (e.from === selected || e.to === selected);
        return (
          <line
            key={e.key}
            className={`edge ${e.lit ? 'lit' : ''} ${e.alt ? 'alt' : ''} ${big ? 'draw' : ''} ${rel ? 'rel' : ''}`}
            style={cssVars({ '--i': i })}
            pathLength={1}
            x1={e.x1}
            y1={e.y1}
            x2={e.x2}
            y2={e.y2}
          />
        );
      })}
      {view.stars.map((star, i) => (
        <StarNode
          key={star.slug}
          star={star}
          index={i}
          big={big}
          selected={selected === star.slug}
          onSelect={onSelect}
          onOpen={onOpen}
        />
      ))}
    </svg>
  );
}

interface StarProps {
  star: StarView;
  index: number;
  big: boolean;
  selected: boolean;
  onSelect?: (slug: string) => void;
  onOpen?: (slug: string) => void;
}

/** A estrela de um nó. Sem conteúdo e espelho são camadas sobre qualquer estado. */
function StarNode({ star, index, big, selected, onSelect, onOpen }: StarProps) {
  const { cx, cy, r, state } = star;
  const circumference = 2 * Math.PI * (r + 4.5);

  const onKeyDown = (e: KeyboardEvent<SVGGElement>) => {
    if (e.key !== 'Enter' && e.key !== ' ') return;
    e.preventDefault();
    if (selected) onOpen?.(star.slug);
    else onSelect?.(star.slug);
  };

  const interactive = big
    ? {
        tabIndex: 0,
        role: 'button',
        'aria-label': `${star.title}, ${STATE_LABEL[state]}${star.mirror ? `, espelho de ${star.homeBranchName}` : ''}`,
        'aria-pressed': selected,
        onClick: () => onSelect?.(star.slug),
        onDoubleClick: () => onOpen?.(star.slug),
        onKeyDown,
      }
    : {};

  return (
    <g
      className={`star ${state} ${star.planned ? 'planejado' : ''} ${selected ? 'sel' : ''}`}
      style={cssVars({ '--i': index, '--home': star.homeColor })}
      data-slug={star.slug}
      {...interactive}
    >
      <circle className="base" cx={cx} cy={cy} r={r + 1} />
      {state === 'dominado' ? (
        <>
          <circle className="halo" cx={cx} cy={cy} r={r + 8} />
          <circle className="fill" cx={cx} cy={cy} r={r} />
        </>
      ) : (
        <>
          {state === 'estudando' && <circle className="pulse" cx={cx} cy={cy} r={r} />}
          <circle className="ring" cx={cx} cy={cy} r={r} />
          {state === 'em_progresso' && (
            <>
              <circle
                className="prog"
                cx={cx}
                cy={cy}
                r={r + 4.5}
                strokeDasharray={`${(circumference * star.level) / star.maxLevel} ${circumference}`}
                transform={`rotate(-90 ${cx} ${cy})`}
              />
              <circle className="fill" cx={cx} cy={cy} r={r * 0.38} />
            </>
          )}
        </>
      )}
      {star.mirror && <circle className="mirror" cx={cx} cy={cy} r={r + (state === 'dominado' ? 12 : 8.5)} />}
      {big && (
        <>
          <circle className="selring" cx={cx} cy={cy} r={r + 15} />
          <text className="lbl" x={cx} y={cy + r + 24}>
            {star.title}
          </text>
          {star.mirror && (
            <text className="tag" x={cx} y={cy + r + 38}>
              ↗ {star.homeBranchName}
            </text>
          )}
          <circle className="hit" cx={cx} cy={cy} r={r + 18} />
        </>
      )}
    </g>
  );
}
