import { useLayoutEffect, useMemo, useRef, type CSSProperties, type KeyboardEvent, type RefObject } from 'react';
import {
  LABEL_FONT,
  SKY_H,
  SKY_W,
  placeLabels,
  px,
  py,
  type ConstellationView,
  type LabelPlacement,
  type StarView,
  type ViewBox,
} from '../store/views';
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
  /**
   * Câmera: o viewBox para onde animar. O zoom acontece no próprio SVG, que
   * é redesenhado a cada quadro (nítido em qualquer aproximação).
   */
  camera?: { viewBox: ViewBox; duration: number; ease: (t: number) => number };
}

const cssVars = (vars: Record<string, string | number>) => vars as CSSProperties;

/**
 * Uma branch como constelação: SVG feito à mão, como no protótipo. As linhas
 * são requisitos (acesa = cumprido, tracejada = alternativa OU). As estrelas
 * são StarNodes; a forma diz o estado sem precisar de texto.
 */
export function Constellation({ view, label, big = false, selected = null, onSelect, onOpen, camera }: Props) {
  const svg = useRef<SVGSVGElement>(null);
  useCamera(svg, camera);
  const labels = useMemo(() => (big ? placeLabels(view.stars, view.edges) : {}), [big, view]);

  if (view.stars.length === 0) {
    return (
      <svg className="constellation" viewBox={`0 0 ${SKY_W} ${SKY_H}`} role="img" aria-label={`${label}: nenhuma habilidade ainda`}>
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
      ref={svg}
      className={`constellation ${big ? 'big' : ''} ${big && selected ? 'focus' : ''}`}
      viewBox={camera ? undefined : `0 0 ${SKY_W} ${SKY_H}`}
      preserveAspectRatio="xMidYMid meet"
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
          label={labels[star.slug]}
          onSelect={onSelect}
          onOpen={onOpen}
        />
      ))}
    </svg>
  );
}

/**
 * Anima o viewBox do SVG até o da câmera. Fica fora do React (atributo
 * direto, a cada quadro) para não re-renderizar a constelação 60 vezes por
 * segundo. Com movimento reduzido, vai direto ao destino.
 */
function useCamera(svg: RefObject<SVGSVGElement | null>, camera: Props['camera']) {
  const current = useRef<ViewBox | null>(null);
  const latest = useRef(camera);
  const target = camera?.viewBox.join(' ');

  // Duração e curva vêm junto com o destino; o efeito abaixo reage só a ele.
  useLayoutEffect(() => {
    latest.current = camera;
  });

  useLayoutEffect(() => {
    const el = svg.current;
    const camera = latest.current;
    if (!el || !camera) return;
    const to = camera.viewBox;
    const from = current.current;
    const set = (vb: ViewBox) => {
      current.current = vb;
      el.setAttribute('viewBox', vb.join(' '));
    };
    if (!from || matchMedia('(prefers-reduced-motion: reduce)').matches) {
      set(to);
      return;
    }
    const start = performance.now();
    let frame = 0;
    const step = (now: number) => {
      const t = camera.ease(Math.min(1, (now - start) / camera.duration));
      set(from.map((v, i) => v + (to[i] - v) * t) as ViewBox);
      if (t < 1) frame = requestAnimationFrame(step);
    };
    frame = requestAnimationFrame(step);
    return () => cancelAnimationFrame(frame);
  }, [svg, target]);
}

interface StarProps {
  star: StarView;
  index: number;
  /** Onde vai o nome (só na constelação expandida). */
  label?: LabelPlacement;
  big: boolean;
  selected: boolean;
  onSelect?: (slug: string) => void;
  onOpen?: (slug: string) => void;
}

/** A estrela de um nó. Sem conteúdo e espelho são camadas sobre qualquer estado. */
function StarNode({ star, index, big, selected, label, onSelect, onOpen }: StarProps) {
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
          <text className="lbl" x={label?.x ?? cx} y={label?.y ?? cy + r + 24} textAnchor={label?.anchor ?? 'middle'}>
            {star.title}
          </text>
          {star.mirror && (
            <text
              className="tag"
              x={label?.x ?? cx}
              y={(label?.y ?? cy + r + 24) + LABEL_FONT * 1.2}
              textAnchor={label?.anchor ?? 'middle'}
            >
              ↗ {star.homeBranchName}
            </text>
          )}
          <circle className="hit" cx={cx} cy={cy} r={r + 18} />
        </>
      )}
    </g>
  );
}
