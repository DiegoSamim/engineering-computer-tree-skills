import { useEffect, useLayoutEffect, useMemo, useRef, useState, type CSSProperties, type MouseEvent } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { NotFound, PageTop } from '../../app/AppShell';
import { useEscape } from '../../app/useEscape';
import { CAMERA_DIVE, CAMERA_FOCUS, cameraTransform, constellationView, nodeView, type NodeView } from '../../store/views';
import { useReady } from '../../store/useTree';
import { Constellation } from '../../ui/Constellation';
import { Legend } from '../../ui/Legend';
import { NodePanel } from './NodePanel';

/** Largura do painel lateral no desktop (igual ao CSS). */
const PANEL_W = 340;
/** Abaixo disto o painel vira uma folha por baixo da tela. */
const NARROW = 900;
/** Duração do mergulho na estrela antes de abrir a habilidade. */
const DIVE_MS = 520;

export function BranchScreen() {
  const { area = '', branch = '' } = useParams();
  // Trocar de branch (ex.: "Ir para a casa") remonta a tela, com a seleção certa.
  return <BranchSky key={`${area}/${branch}`} area={area} branch={branch} />;
}

/**
 * Constelação expandida. Clicar numa estrela leva a câmera até ela (zoom em
 * perspectiva) e abre o painel lateral; Enter ou duplo clique mergulha na
 * estrela e abre a habilidade; Esc afasta a câmera e, depois, volta ao
 * carrossel.
 */
function BranchSky({ area: areaSlug, branch: branchSlug }: { area: string; branch: string }) {
  const { index, state } = useReady();
  const navigate = useNavigate();
  const location = useLocation();
  const key = `${areaSlug}/${branchSlug}`;
  const area = index.areas.get(areaSlug);
  const branch = index.branches.get(key);

  // Voltando da página de uma habilidade, ela chega selecionada.
  const [selected, setSelected] = useState<string | null>((location.state as { selected?: string } | null)?.selected ?? null);
  const [diving, setDiving] = useState<string | null>(null);
  const view = useMemo(() => constellationView(index, state, key, true), [index, state, key]);
  const panel = selected ? nodeView(index, state, selected, key) : null;

  // Tamanho da cena, para a câmera saber onde a estrela está em pixels.
  const sky = useRef<HTMLDivElement>(null);
  const [box, setBox] = useState({ width: 0, height: 0, narrow: false });
  useLayoutEffect(() => {
    const el = sky.current;
    if (!el) return;
    const measure = () => setBox({ width: el.clientWidth, height: el.clientHeight, narrow: innerWidth <= NARROW });
    const observer = new ResizeObserver(measure);
    observer.observe(el);
    measure();
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!selected) return;
    sky.current?.querySelector<SVGGElement>(`[data-slug="${selected}"]`)?.focus({ preventScroll: true });
  }, [selected]);

  const dive = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  useEffect(() => () => clearTimeout(dive.current), []);

  useEscape(() => {
    if (diving) return;
    if (selected) setSelected(null);
    else navigate(`/a/${areaSlug}`, { state: { branch: key } });
  });

  if (!area || !branch) return <NotFound what="Esta branch" />;

  const count = state.branches[key] ?? { done: 0, total: 0 };

  const open = (slug: string) => {
    if (diving) return;
    const go = () => navigate(`/n/${slug}`, { state: { from: key } });
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) return go();
    setSelected(slug);
    setDiving(slug);
    dive.current = setTimeout(go, DIVE_MS);
  };
  const goHome = (v: NodeView) => {
    const home = index.branches.get(v.homeBranch.key)!;
    navigate(`/a/${home.area}/${home.slug}`, { state: { selected: v.node.slug } });
  };
  // Clique no céu vazio afasta a câmera.
  const onSkyClick = (e: MouseEvent) => {
    if (!(e.target as Element).closest('.star')) setSelected(null);
  };

  // A estrela vai para o centro da parte do céu que o painel não cobre.
  const focus = diving ?? selected;
  const star = focus ? view.stars.find((s) => s.slug === focus) : undefined;
  const target = box.narrow ? { x: box.width / 2, y: box.height * 0.28 } : { x: (box.width - PANEL_W) / 2, y: box.height / 2 };
  const transform = star && box.width > 0 ? cameraTransform(star, box, target, diving ? CAMERA_DIVE : CAMERA_FOCUS) : 'none';

  return (
    <>
      <PageTop crumbs={[{ label: area.name, to: `/a/${area.slug}`, state: { branch: key } }, { label: branch.name }]} />
      <main className={`view branch ${panel ? 'has-sel' : ''}`}>
        <section className="sky-panel">
          <div className="branch-head">
            <div>
              <div className="eyebrow">{area.name}</div>
              <h1>{branch.name}</h1>
            </div>
            <div className="stat">
              <b>{count.done}</b> / {count.total}
              <br />
              habilidades concluídas
            </div>
          </div>
          <div
            className="big-sky"
            ref={sky}
            onClick={onSkyClick}
            style={{ perspectiveOrigin: `${target.x}px ${target.y}px` } as CSSProperties}
          >
            {view.stars.length > 0 ? (
              <div className={`scene ${diving ? 'diving' : ''}`} style={{ transform }}>
                <Constellation view={view} label={branch.name} big selected={selected} onSelect={setSelected} onOpen={open} />
              </div>
            ) : (
              <p className="empty-sky">
                Esta branch ainda não tem habilidades. Ela ganha a primeira quando o conteúdo dela começar a ser escrito.
              </p>
            )}
          </div>
          <div className="sky-foot">
            {!panel && view.stars.length > 0 && (
              <p className="pick-hint">
                Clique numa estrela para ver o que ela exige e o que ela libera. Duplo clique ou Enter abre a habilidade.
              </p>
            )}
            <Legend />
          </div>
        </section>
        <aside className={`panel ${panel ? 'on' : ''}`} aria-live="polite" aria-label="Habilidade selecionada" aria-hidden={!panel}>
          {panel && (
            <>
              <button type="button" className="panel-close" aria-label="Fechar painel" onClick={() => setSelected(null)}>
                ×
              </button>
              <NodePanel view={panel} onOpen={open} onGoHome={goHome} />
            </>
          )}
        </aside>
      </main>
    </>
  );
}
