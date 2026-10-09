import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { GraphLab } from '../features/lab/GraphLab';
import { AreaScreen } from '../features/area/AreaScreen';
import { SkyScreen } from '../features/sky/SkyScreen';
import { AppShell, NotFound } from './AppShell';

export function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<AppShell />}>
          <Route index element={<SkyScreen />} />
          <Route path="a/:area" element={<AreaScreen />} />
          <Route path="*" element={<NotFound />} />
        </Route>
        {/* O lab de grafos tem layout próprio; vira visualizador de nós na Fase 6. */}
        <Route
          path="/lab/grafos"
          element={
            <div className="h-full bg-surface text-ink">
              <GraphLab />
            </div>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}
