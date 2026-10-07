import type { AlgorithmDefinition } from '../simulation/types';
import { irrevocable } from './irrevocable';
import { bfs } from './bfs';
import { dfs } from './dfs';
import { backtracking } from './backtracking';
import { uniformCost } from './uniformCost';
import { greedy } from './greedy';
import { astar } from './astar';
import { idastar } from './idastar';

/**
 * Every algorithm the app knows about, in the order they appear in the
 * sidebar. Adding a new one is: build its folder (run/narration/theory),
 * then add it here — nothing else needs to change.
 */
export const ALGORITHMS: AlgorithmDefinition[] = [
  irrevocable,
  bfs,
  dfs,
  backtracking,
  uniformCost,
  greedy,
  astar,
  idastar,
];

export function getAlgorithm(id: string): AlgorithmDefinition | undefined {
  return ALGORITHMS.find((a) => a.id === id);
}

/** Algorithms with a working run()/narrate() — the rest are theory-only for now. */
export function isImplemented(algorithm: AlgorithmDefinition): boolean {
  return Boolean(algorithm.run && algorithm.narrate);
}
