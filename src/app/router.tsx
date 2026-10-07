import { useEffect } from 'react';
import { BrowserRouter, Navigate, Outlet, Route, Routes } from 'react-router-dom';
import { useProgress } from '../store/useProgress';
import { AppHeader } from './AppHeader';
import { OnboardingScreen } from '../features/onboarding/OnboardingScreen';
import { RoadmapScreen } from '../features/roadmap/RoadmapScreen';
import { TopicScreen } from '../features/topic/TopicScreen';
import { SignalsScreen } from '../features/signals/SignalsScreen';
import { GraphLab } from '../features/lab/GraphLab';

/** Blocks rendering until the stored snapshot is loaded, so no screen ever
 *  flashes "empty progress" before the real data arrives. */
function Bootstrap({ children }: { children: React.ReactNode }) {
  const loaded = useProgress((s) => s.loaded);
  const error = useProgress((s) => s.error);
  const hydrate = useProgress((s) => s.hydrate);

  useEffect(() => {
    void hydrate();
  }, [hydrate]);

  if (error && !loaded) return <ConnectionError message={error} onRetry={() => void hydrate()} />;
  if (!loaded) return <div className="h-full bg-surface" />;
  return <>{children}</>;
}

/** Falha de conexão com o backend. Visível e acionável — nunca um fallback
 *  silencioso para o localStorage, que criaria duas fontes de verdade. */
function ConnectionError({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <div className="flex h-full items-center justify-center bg-surface px-6">
      <div className="max-w-[460px]">
        <div
          className="mb-3 font-mono-num text-[11px] uppercase tracking-[0.18em]"
          style={{ color: 'var(--color-state-danger)' }}
        >
          Sem conexão com o servidor
        </div>
        <h1 className="mb-3 text-[22px] font-semibold tracking-tight text-ink">
          Não foi possível carregar seu progresso.
        </h1>
        <p className="mb-2 text-[13.5px] leading-relaxed text-ink-muted">{message}</p>
        <p className="mb-6 text-[12.5px] leading-relaxed text-ink-faint">
          O app não grava no navegador enquanto o servidor está fora do ar — isso evita que o mesmo
          progresso exista em dois lugares com conteúdos diferentes. Verifique se a API subiu na
          porta 8787 e tente de novo.
        </p>
        <button
          type="button"
          onClick={onRetry}
          className="h-10 px-5 text-[13.5px] font-semibold"
          style={{ background: 'var(--color-accent)', color: 'var(--color-on-accent)' }}
        >
          Tentar novamente
        </button>
      </div>
    </div>
  );
}

/** Falha depois do app carregado (ex.: servidor caiu no meio da sessão). */
function ConnectionBanner() {
  const error = useProgress((s) => s.error);
  const loaded = useProgress((s) => s.loaded);
  const hydrate = useProgress((s) => s.hydrate);

  if (!error || !loaded) return null;

  return (
    <div
      className="flex shrink-0 items-center gap-3 border-b px-5 py-2 text-[12px]"
      style={{ borderColor: 'var(--color-state-danger)', background: 'rgba(248,81,73,.1)' }}
    >
      <span style={{ color: 'var(--color-state-danger)' }}>●</span>
      <span className="text-ink-muted">
        A última alteração não foi salva: {error}
      </span>
      <button
        type="button"
        onClick={() => void hydrate()}
        className="ml-auto underline"
        style={{ color: 'var(--color-state-danger)' }}
      >
        Reconectar
      </button>
    </div>
  );
}

/** Everything past onboarding needs a name and shows the global header. */
function ShellRoute() {
  const profile = useProgress((s) => s.snapshot.profile);
  if (!profile) return <Navigate to="/" replace />;

  return (
    <div className="flex h-full flex-col bg-surface text-ink">
      <AppHeader />
      <ConnectionBanner />
      <div className="min-h-0 flex-1">
        <Outlet />
      </div>
    </div>
  );
}

export function AppRouter() {
  return (
    <BrowserRouter>
      <Bootstrap>
        <Routes>
          <Route path="/" element={<OnboardingScreen />} />
          <Route element={<ShellRoute />}>
            <Route path="/roadmap" element={<RoadmapScreen />} />
            <Route path="/topico/:topicId" element={<TopicScreen />} />
            <Route path="/sinais" element={<SignalsScreen />} />
            <Route path="/lab/grafos" element={<GraphLab />} />
          </Route>
          <Route path="*" element={<Navigate to="/roadmap" replace />} />
        </Routes>
      </Bootstrap>
    </BrowserRouter>
  );
}
