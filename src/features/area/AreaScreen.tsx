import { useEffect, useLayoutEffect, useMemo, useRef, useState, type CSSProperties, type PointerEvent } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { NotFound, PageTop } from '../../app/AppShell';
import { useEscape } from '../../app/useEscape';
import { cardPosition, carouselLayout, circularOffset, constellationView, firstBranchWithNodes, wrapIndex } from '../../store/views';
import { useReady } from '../../store/useTree';
import { BranchCard } from '../../ui/BranchCard';
import { Icon } from '../../ui/Icon';

/** Arrasto mínimo, em px, para contar como swipe. */
const SWIPE = 50;

/**
 * Área: carrossel de branches, sem fim nos dois sentidos. A carta central
 * abre a constelação; as vizinhas se centralizam. Setas, pontos, ← → e
 * arrastar navegam.
 */
export function AreaScreen() {
  const { area = '' } = useParams();
  // A chave remonta a tela ao trocar de área: o índice do carrossel é por área.
  return <AreaCarousel key={area} slug={area} />;
}

function AreaCarousel({ slug }: { slug: string }) {
  const { index, state } = useReady();
  const navigate = useNavigate();
  const location = useLocation();

  const area = index.areas.get(slug);
  const branches = useMemo(() => index.branchesByArea.get(slug) ?? [], [index, slug]);
  const views = useMemo(() => branches.map((b) => constellationView(index, state, b.key, false)), [branches, index, state]);

  // Voltando de uma branch (Esc ou migalha), o carrossel abre nela.
  const from = (location.state as { branch?: string } | null)?.branch;
  const initial = Math.max(0, from ? branches.findIndex((b) => b.key === from) : firstBranchWithNodes(index, slug));
  // O índice anterior junto: a carta que pula mais de uma posição entre os
  // dois deu a volta e troca de ponta sem atravessar a tela.
  const [{ current, from: previousIndex }, setPosition] = useState({ current: initial, from: initial });
  const setCurrent = (next: number | ((i: number) => number)) =>
    setPosition((p) => ({ current: typeof next === 'function' ? next(p.current) : next, from: p.current }));

  const carousel = useRef<HTMLDivElement>(null);
  const cards = useRef<(HTMLButtonElement | null)[]>([]);
  const [viewport, setViewport] = useState(0);
  useLayoutEffect(() => {
    const el = carousel.current;
    if (!el) return;
    const observer = new ResizeObserver(() => setViewport(el.clientWidth));
    observer.observe(el);
    setViewport(el.clientWidth);
    return () => observer.disconnect();
  }, []);

  const shift = (delta: number, focus = false) => {
    setCurrent((i) => {
      const next = wrapIndex(i + delta, branches.length);
      if (focus) requestAnimationFrame(() => cards.current[next]?.focus({ preventScroll: true }));
      return next;
    });
  };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') return;
      shift(e.key === 'ArrowRight' ? 1 : -1, true);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  });

  useEscape(() => navigate('/'));

  // Arrastar no celular; o clique que encerra um arrasto não abre a carta.
  const dragStart = useRef<number | null>(null);
  const swiped = useRef(false);
  const onPointerDown = (e: PointerEvent) => {
    dragStart.current = e.clientX;
  };
  const onPointerUp = (e: PointerEvent) => {
    if (dragStart.current === null) return;
    const dx = e.clientX - dragStart.current;
    dragStart.current = null;
    if (Math.abs(dx) > SWIPE) {
      shift(dx < 0 ? 1 : -1);
      swiped.current = true;
      setTimeout(() => (swiped.current = false), 50);
    }
  };

  if (!area) return <NotFound what="Esta área" />;

  const count = state.areas[slug] ?? { done: 0, total: 0 };
  const layout = carouselLayout(viewport);
  const offsets = branches.map((_, i) => circularOffset(i, current, branches.length));

  const onCard = (i: number) => {
    if (swiped.current) return;
    if (i === current) navigate(`/a/${slug}/${branches[i].slug}`);
    else setCurrent(i);
  };

  return (
    <>
      <PageTop crumbs={[{ label: area.name }]} />
      <main className="view">
        <div className="area-head">
          <div className="eyebrow">{area.name}</div>
          <p>
            {area.sub} · <span className="mono">{count.done}/{count.total}</span> habilidades concluídas · {branches.length} branches
          </p>
        </div>

        {branches.length === 0 ? (
          <div className="status-screen">
            <p className="empty-sky">Esta área ainda não tem branches. Ela ganha a primeira quando o conteúdo dela começar a ser escrito.</p>
          </div>
        ) : (
          <>
            <div className="carousel" ref={carousel} onPointerDown={onPointerDown} onPointerUp={onPointerUp}>
              <div
                className="track"
                style={{ '--w': `${layout.cardWidth}px` } as CSSProperties}
              >
                {branches.map((b, i) => (
                  <BranchCard
                    key={b.key}
                    ref={(el) => {
                      cards.current[i] = el;
                    }}
                    name={b.name}
                    view={views[i]}
                    done={state.branches[b.key]?.done ?? 0}
                    total={state.branches[b.key]?.total ?? 0}
                    position={cardPosition(i, current, branches.length)}
                    offsetX={offsets[i] * (layout.cardWidth + layout.gap)}
                    jump={Math.abs(offsets[i] - circularOffset(i, previousIndex, branches.length)) > 1}
                    onClick={() => onCard(i)}
                  />
                ))}
              </div>
            </div>
            <nav className="pager" aria-label="Branches">
              <button type="button" aria-label="Branch anterior" onClick={() => shift(-1)}>
                <Icon name="left" />
              </button>
              <span className="dots">
                {branches.map((b, i) => (
                  <button
                    key={b.key}
                    type="button"
                    className={i === current ? 'on' : ''}
                    aria-label={b.name}
                    aria-current={i === current ? 'true' : undefined}
                    onClick={() => setCurrent(i)}
                  >
                    <i />
                  </button>
                ))}
              </span>
              <button type="button" aria-label="Próxima branch" onClick={() => shift(1)}>
                <Icon name="right" />
              </button>
            </nav>
          </>
        )}
      </main>
    </>
  );
}
