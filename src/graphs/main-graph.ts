import type { GraphProblem } from '../domain/types';

/**
 * The main graph used throughout the app. A single graph, six lessons:
 * see the plan doc (`docs` section 3) for the fully worked-out traces of
 * every algorithm on this exact graph — they are what the Vitest suite
 * pins down.
 *
 * Heuristic h(n) is an admissible, consistent estimate of the cost to G,
 * chosen deliberately so that:
 *  - BFS returns S→C→G (fewest edges, cost 12)
 *  - DFS returns S→A→E→G (cost 14), detouring through the D→H→X dead end
 *  - Uniform-cost / A* return the optimal S→B→F→G (cost 8)
 *  - Greedy is fooled by h and also returns S→A→E→G (cost 14)
 *  - An irrevocable (never-backtrack) search fails despite a solution existing
 */
export const mainGraph: GraphProblem = {
  id: 'main',
  name: 'Grafo introdutório',
  summary: 'S até G — o grafo de referência usado para comparar todos os algoritmos.',
  teachingPoint:
    'Menor número de passos não é o mesmo que menor custo. Mostra como cada algoritmo chega a um resultado diferente no mesmo grafo.',
  tieBreak: 'declaration',
  start: 'S',
  goals: ['G'],
  nodes: [
    { id: 'S', x: 460, y: 60, heuristic: 4 },
    { id: 'A', x: 230, y: 190, heuristic: 3 },
    { id: 'B', x: 460, y: 190, heuristic: 4 },
    { id: 'C', x: 690, y: 190, heuristic: 8 },
    { id: 'D', x: 140, y: 320, heuristic: 9 },
    { id: 'E', x: 320, y: 320, heuristic: 1 },
    { id: 'F', x: 460, y: 320, heuristic: 2 },
    { id: 'G', x: 560, y: 470, heuristic: 0 },
    { id: 'H', x: 140, y: 440, heuristic: 10 },
    { id: 'X', x: 140, y: 560, heuristic: 12, note: 'Beco sem saída' },
  ],
  edges: [
    { id: 'S->A', from: 'S', to: 'A', cost: 1, directed: true },
    { id: 'S->B', from: 'S', to: 'B', cost: 4, directed: true },
    { id: 'S->C', from: 'S', to: 'C', cost: 2, directed: true },
    { id: 'A->D', from: 'A', to: 'D', cost: 1, directed: true },
    { id: 'A->E', from: 'A', to: 'E', cost: 5, directed: true },
    { id: 'D->H', from: 'D', to: 'H', cost: 1, directed: true },
    { id: 'H->X', from: 'H', to: 'X', cost: 1, directed: true },
    { id: 'E->G', from: 'E', to: 'G', cost: 8, directed: true },
    { id: 'B->F', from: 'B', to: 'F', cost: 2, directed: true },
    { id: 'F->G', from: 'F', to: 'G', cost: 2, directed: true },
    { id: 'C->G', from: 'C', to: 'G', cost: 10, directed: true },
  ],
};
