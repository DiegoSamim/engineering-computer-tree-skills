import { useEffect, useMemo, useRef, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { NotFound, PageTop } from '../../app/AppShell';
import { useEscape } from '../../app/useEscape';
import { constellationView, nodeView, type NodeView } from '../../store/views';
import { useReady } from '../../store/useTree';
import { Constellation } from '../../ui/Constellation';
import { Legend } from '../../ui/Legend';
import { NodePanel } from './NodePanel';

export function BranchScreen() {
  const { area = '', branch = '' } = useParams();
  // Trocar de branch (ex.: "Ir para a casa") remonta a tela, com a seleção certa.
  return <BranchSky key={`${area}/${branch}`} area={area} branch={branch} />;
}

/**
 * Constelação expandida + painel. Clique seleciona a estrela; Enter ou duplo
 * clique abre o nó; Esc tira a seleção e, depois, volta ao carrossel.
 */
function BranchSky({ area: areaSlug, branch: branchSlug }: { area: string; branch: string }) {
  const { index, state } = useReady();
  const navigate = useNavigate();
  const location = useLocation();
  const key = `${areaSlug}/${branchSlug}`;
  const area = index.areas.get(areaSlug);
  const branch = index.branches.get(key);

  // Voltando da página de um nó, ele chega selecionado.
  const [selected, setSelected] = useState<string | null>((location.state as { selected?: string } | null)?.selected ?? null);
  const view = useMemo(() => constellationView(index, state, key, true), [index, state, key]);
  const panel = selected ? nodeView(index, state, selected, key) : null;

  const sky = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!selected) return;
    sky.current?.querySelector<SVGGElement>(`[data-slug="${selected}"]`)?.focus({ preventScroll: true });
  }, [selected]);

  useEscape(() => {
    if (selected) setSelected(null);
    else navigate(`/a/${areaSlug}`, { state: { branch: key } });
  });

  if (!area || !branch) return <NotFound what="Esta branch" />;

  const count = state.branches[key] ?? { done: 0, total: 0 };
  const open = (slug: string) => navigate(`/n/${slug}`, { state: { from: key } });
  const goHome = (v: NodeView) => {
    const home = index.branches.get(v.homeBranch.key)!;
    navigate(`/a/${home.area}/${home.slug}`, { state: { selected: v.node.slug } });
  };

  return (
    <>
      <PageTop crumbs={[{ label: area.name, to: `/a/${area.slug}`, state: { branch: key } }, { label: branch.name }]} />
      <main className="view branch">
        <section className="sky-panel">
          <div className="branch-head">
            <div>
              <div className="eyebrow">{area.name}</div>
              <h1>{branch.name}</h1>
            </div>
            <div className="stat">
              <b>{count.done}</b> / {count.total}
              <br />
              nós concluídos
            </div>
          </div>
          <div className="big-sky" ref={sky}>
            {view.stars.length > 0 ? (
              <Constellation view={view} label={branch.name} big selected={selected} onSelect={setSelected} onOpen={open} />
            ) : (
              <p className="empty-sky">Esta branch ainda não tem nós. Ela ganha o primeiro quando você estudar um tópico dela.</p>
            )}
          </div>
          <Legend />
        </section>
        <aside className="panel" aria-live="polite" aria-label="Nó selecionado">
          <NodePanel view={panel} onOpen={open} onGoHome={goHome} />
        </aside>
      </main>
    </>
  );
}
