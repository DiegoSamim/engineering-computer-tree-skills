import { useEffect, type CSSProperties } from 'react';
import { Link, Outlet, useMatch } from 'react-router-dom';
import type { CatalogIndex } from '../domain/tree/catalogIndex';
import { homeAreaOf } from '../domain/tree/catalogIndex';
import { useTree } from '../store/useTree';
import { Button } from '../ui/controls';
import { StarField } from '../ui/StarField';
import { Toast } from '../ui/Toast';
import { TopBar, type Crumb } from '../ui/TopBar';

/**
 * Casca das telas da árvore: céu de fundo, carregamento do catálogo e do
 * estado, a cor da área corrente (--c) e os avisos. Cada tela desenha o
 * próprio cabeçalho com `PageTop`.
 */
export function AppShell() {
  const status = useTree((s) => s.status);
  const index = useTree((s) => s.index);
  const load = useTree((s) => s.load);

  useEffect(() => {
    if (!useTree.getState().index) void load();
  }, [load]);

  const nodeMatch = useMatch('/n/:slug');
  const areaMatch = useMatch('/a/:area/*');
  const view = nodeMatch ? 'node' : areaMatch ? 'area' : 'sky';
  const accent = accentColor(index, areaMatch?.params.area, nodeMatch?.params.slug);

  return (
    <div className="shell" data-view={view} style={accent ? ({ '--c': accent } as CSSProperties) : undefined}>
      <StarField />
      <div className="app">
        {status === 'ready' ? <Outlet /> : status === 'error' ? <ConnectionError /> : <Loading />}
      </div>
      <SaveError />
      <Toast />
    </div>
  );
}

/** Cor da área da tela: a da área aberta, ou a da casa do nó aberto. */
function accentColor(index: CatalogIndex | null, area?: string, slug?: string): string | undefined {
  if (!index) return undefined;
  if (slug) {
    const node = index.nodes.get(slug);
    return node ? homeAreaOf(index, node)?.color : undefined;
  }
  return area ? index.areas.get(area)?.color : undefined;
}

/** Cabeçalho de uma tela, com o contador global vindo do estado. */
export function PageTop({ crumbs }: { crumbs?: Crumb[] }) {
  const totals = useTree((s) => s.state?.totals);
  return <TopBar crumbs={crumbs} done={totals?.done ?? 0} total={totals?.total ?? 0} />;
}

function Loading() {
  return (
    <main className="status-screen" aria-busy="true">
      <p className="loading">Carregando o mapa…</p>
    </main>
  );
}

function ConnectionError() {
  const error = useTree((s) => s.error);
  const load = useTree((s) => s.load);
  return (
    <main className="status-screen">
      <div className="box">
        <div className="eyebrow">Sem conexão</div>
        <h1>Não foi possível carregar o mapa.</h1>
        <p>{error}</p>
        <p>O progresso fica só no servidor local, nunca no navegador. Suba a API com ./scripts/start.sh ou npm run server e tente de novo.</p>
        <Button onClick={() => void load()}>Tentar de novo</Button>
      </div>
    </main>
  );
}

function SaveError() {
  const error = useTree((s) => s.saveError);
  const dismiss = useTree((s) => s.dismissSaveError);
  if (!error) return null;
  return (
    <div className="save-error" role="alert">
      <b>Não foi salvo.</b>
      <span>{error}</span>
      <Button variant="ghost" onClick={dismiss}>
        Fechar
      </Button>
    </div>
  );
}

/** Rota desconhecida ou slug que não existe no catálogo. */
export function NotFound({ what = 'Esta página' }: { what?: string }) {
  return (
    <>
      <PageTop />
      <main className="status-screen view">
        <div className="box">
          <div className="eyebrow">Fora do mapa</div>
          <h1>{what} não existe.</h1>
          <p>O endereço pode ter um slug antigo ou digitado errado.</p>
          <Link className="btn" to="/">
            Voltar ao céu
          </Link>
        </div>
      </main>
    </>
  );
}
