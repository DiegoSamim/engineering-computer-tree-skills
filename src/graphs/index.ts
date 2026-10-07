import type { GraphProblem } from '../domain/types';
import { mainGraph } from './main-graph';

/** Every playable graph. More examples (labirinto, armadilha, ...) join this array later. */
export const GRAPHS: GraphProblem[] = [mainGraph];

export function getGraph(id: string): GraphProblem | undefined {
  return GRAPHS.find((g) => g.id === id);
}

/**
 * Examples planned but not yet built — shown disabled in the sidebar so the
 * final shape of the list is visible from day one, per the interface spec.
 */
export const PLANNED_EXAMPLES = [
  'Labirinto',
  'Rotas entre cidades',
  'Caminho com armadilha',
  'Heurística ruim',
  'Grande árvore',
  'Grafo personalizado',
];
