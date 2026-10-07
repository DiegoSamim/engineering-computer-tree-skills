import type { AlgorithmDefinition } from '../../simulation/types';
import { run } from './run';
import { narrate } from './narration';
import { theory } from './theory';
import { code } from './code';

export const idastar: AlgorithmDefinition = {
  id: 'idastar',
  name: 'IDA*',
  shortSummary: 'A* com busca em profundidade e limite de f(n) crescente por iteração. Otimalidade do A* com memória de DFS.',
  frontierKind: 'iterative-deepening',
  run,
  narrate,
  theory,
  code,
};
