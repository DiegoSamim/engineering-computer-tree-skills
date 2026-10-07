import type { AlgorithmDefinition } from '../../simulation/types';
import { run } from './run';
import { narrate } from './narration';
import { theory } from './theory';
import { code } from './code';

export const astar: AlgorithmDefinition = {
  id: 'astar',
  name: 'A*',
  shortSummary: 'Combina custo acumulado g(n) e estimativa h(n). Ótima, com uma heurística admissível.',
  frontierKind: 'priority',
  run,
  narrate,
  theory,
  code,
};
