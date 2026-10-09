import { lazy, Suspense } from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { AreaScreen } from '../features/area/AreaScreen';
import { BranchScreen } from '../features/branch/BranchScreen';
import { NodeScreen } from '../features/node/NodeScreen';
import { SkyScreen } from '../features/sky/SkyScreen';
import { AppShell, NotFound } from './AppShell';

// O lab de grafos é pesado (algoritmos, framer-motion) e não faz parte da
// árvore: carrega só quando alguém abre /lab/grafos.
const GraphLab = lazy(() => import('../features/lab/GraphLab').then((m) => ({ default: m.GraphLab })));

export function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<AppShell />}>
          <Route index element={<SkyScreen />} />
          <Route path="a/:area" element={<AreaScreen />} />
          <Route path="a/:area/:branch" element={<BranchScreen />} />
          <Route path="n/:slug" element={<NodeScreen />} />
          <Route path="*" element={<NotFound />} />
        </Route>
        {/* O lab de grafos tem layout próprio; vira visualizador de nós na Fase 6. */}
        <Route
          path="/lab/grafos"
          element={
            <div className="h-full bg-surface text-ink">
              <Suspense fallback={null}>
                <GraphLab />
              </Suspense>
            </div>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}
