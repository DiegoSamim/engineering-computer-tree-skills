import { useCallback, useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { NotFound, PageTop } from '../../app/AppShell';
import { useEscape } from '../../app/useEscape';
import { getTopicContent } from '../../content/topics/registry';
import { GUIDES, isGuideId, type GuideId } from '../../domain/tree/guides';
import type { ProgressEventInput } from '../../domain/tree/types';
import { levelChangeMessage, nodeView, unlockHints } from '../../store/views';
import { useReady, useTree } from '../../store/useTree';
import { useToast } from '../../store/useToast';
import { Button, Check } from '../../ui/controls';
import { GuideRail } from '../../ui/GuideRail';
import { Icon } from '../../ui/Icon';
import { GuideBody } from './guides/GuideBody';
import { MasteryDrawer } from './MasteryDrawer';
import { NodeHeader } from './NodeHeader';

export function NodeScreen() {
  const { slug = '' } = useParams();
  return <NodePage key={slug} slug={slug} />;
}

/**
 * Página do nó: sóbria. Uma guia por vez (o hash da URL diz qual), navegação
 * em tronco, e status e critérios na gaveta Domínio. ← → trocam de guia;
 * Esc fecha a gaveta ou volta à constelação com o nó selecionado.
 */
function NodePage({ slug }: { slug: string }) {
  const { index, state } = useReady();
  const send = useTree((s) => s.send);
  const toast = useToast((s) => s.show);
  const navigate = useNavigate();
  const location = useLocation();

  // A constelação de onde se veio, se o nó estiver desenhado nela; senão, a casa.
  const from = (location.state as { from?: string } | null)?.from;
  const node = index.nodes.get(slug);
  const viewedIn = node && from && node.placements.some((p) => p.branch === from) ? from : node?.home;
  const view = nodeView(index, state, slug, viewedIn);
  const content = node && node.content !== 'planejado' ? getTopicContent(slug) : undefined;
  const progress = state.nodes[slug];

  const hash = decodeURIComponent(location.hash.slice(1));
  const current: GuideId = isGuideId(hash) ? hash : 'visao-geral';
  const currentIndex = GUIDES.findIndex((g) => g.id === current);
  const read = new Set(progress?.guides ?? []);

  const [drawer, setDrawer] = useState(false);
  const masteryRef = useRef<HTMLButtonElement>(null);
  const readerRef = useRef<HTMLElement>(null);
  const firstGuide = useRef(true);

  const goToGuide = useCallback(
    (id: string) => navigate({ hash: id }, { replace: true, state: location.state }),
    [navigate, location.state],
  );

  // Ao trocar de guia (não na entrada), leva a leitura para o topo da guia.
  useEffect(() => {
    if (firstGuide.current) {
      firstGuide.current = false;
      return;
    }
    const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (readerRef.current && readerRef.current.getBoundingClientRect().top < 0) {
      readerRef.current.scrollIntoView({ block: 'start', behavior: reduce ? 'auto' : 'smooth' });
    }
  }, [current]);

  useEffect(() => {
    if (!content) return;
    const onKey = (e: KeyboardEvent) => {
      if (drawer || (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight')) return;
      const target = e.target as HTMLElement | null;
      if (target?.closest('.viz, input, textarea, [role="tablist"]')) return;
      const next = currentIndex + (e.key === 'ArrowRight' ? 1 : -1);
      if (next >= 0 && next < GUIDES.length) goToGuide(GUIDES[next].id);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [content, drawer, currentIndex, goToGuide]);

  const branchKey = viewedIn ?? '';
  const branch = index.branches.get(branchKey);
  useEscape(() => {
    if (branch) navigate(`/a/${branch.area}/${branch.slug}`, { state: { selected: slug } });
  });

  if (!node || !view || !branch) return <NotFound what="Esta habilidade" />;
  const area = index.areas.get(branch.area)!;

  const emit = async (event: ProgressEventInput) => {
    const result = await send(event);
    if (!result) return;
    const message = levelChangeMessage(index, result.before, result.response.state, slug);
    if (message) toast(message);
  };

  const isRead = read.has(current);
  const toggleRead = () => void emit({ type: isRead ? 'guia_desmarcada' : 'guia_lida', node: slug, guide: current });
  const goNext = () => {
    if (!isRead) void emit({ type: 'guia_lida', node: slug, guide: current });
    goToGuide(GUIDES[currentIndex + 1].id);
  };

  const solved = Object.values(progress?.exercises ?? {}).filter((e) => e.solvedAt).length;
  const prev = GUIDES[currentIndex - 1];
  const next = GUIDES[currentIndex + 1];

  return (
    <>
      <PageTop
        crumbs={[
          { label: area.name, to: `/a/${area.slug}`, state: { branch: branch.key } },
          { label: branch.name, to: `/a/${area.slug}/${branch.slug}`, state: { selected: slug } },
          { label: node.title },
        ]}
      />
      <main className="view node">
        <NodeHeader view={view} onMastery={() => setDrawer(true)} masteryRef={masteryRef} />

        {content ? (
          <>
            <GuideRail
              guides={GUIDES}
              current={current}
              read={read}
              onSelect={goToGuide}
              meta={`${read.size}/${GUIDES.length} lidas · ${solved}/${node.exercises.length} exercícios`}
            />
            <article className="reader" ref={readerRef}>
              <section key={current} className="sec" aria-labelledby="sec-title">
                <div className="sec-top">
                  <span className="n">
                    {String(currentIndex + 1).padStart(2, '0')} / {GUIDES.length}
                  </span>
                  <h2 id="sec-title">{GUIDES[currentIndex].label}</h2>
                </div>
                <GuideBody
                  id={current}
                  content={content}
                  node={node}
                  progress={progress}
                  onExercise={(exercise, solved) =>
                    void emit({ type: solved ? 'exercicio_resolvido' : 'exercicio_desmarcado', node: slug, exercise })
                  }
                />
                <footer className="sec-foot">
                  <button type="button" className={`read-btn ${isRead ? 'on' : ''}`} aria-pressed={isRead} onClick={toggleRead}>
                    <Check on={isRead} />
                    {isRead ? 'Lida' : 'Marcar como lida'}
                  </button>
                  <div className="nav-btns">
                    {prev && (
                      <Button variant="ghost" onClick={() => goToGuide(prev.id)}>
                        <Icon name="left" /> {prev.label}
                      </Button>
                    )}
                    {next && (
                      <Button onClick={goNext}>
                        {next.label} <Icon name="right" />
                      </Button>
                    )}
                  </div>
                </footer>
              </section>
            </article>
          </>
        ) : (
          <>
            <div />
            <div className="empty-node">
              <h2>Conteúdo ainda não escrito</h2>
              <p>
                Esta habilidade já existe no mapa para marcar o caminho e os requisitos. A página ganha as 12 guias quando o conteúdo
                for publicado.
              </p>
              <Button variant="ghost" onClick={() => navigate(`/a/${branch.area}/${branch.slug}`, { state: { selected: slug } })}>
                Voltar à constelação
              </Button>
            </div>
          </>
        )}
      </main>

      <MasteryDrawer
        open={drawer}
        onClose={() => setDrawer(false)}
        returnFocus={masteryRef}
        node={node}
        progress={progress}
        hints={unlockHints(index, slug)}
        onToggle={(criterion, checked) =>
          void emit({ type: checked ? 'criterio_marcado' : 'criterio_desmarcado', node: slug, criterion })
        }
      />
    </>
  );
}
