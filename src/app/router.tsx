import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { GraphLab } from '../features/lab/GraphLab';

/**
 * Durante a refatoração para a skill tree, só o lab de grafos continua no ar.
 * As telas da árvore (céu, área, branch, nó) entram na fase do front mínimo.
 */
export function AppRouter() {
  return (
    <BrowserRouter>
      <div className="h-full bg-surface text-ink">
        <Routes>
          <Route path="/lab/grafos" element={<GraphLab />} />
          <Route path="*" element={<Navigate to="/lab/grafos" replace />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}
