import type { AlgorithmDefinition } from '../../simulation/types';
import { run } from './run';
import { narrate } from './narration';
import { theory } from './theory';
import { code } from './code';

export const dfs: AlgorithmDefinition = {
  id: 'dfs',
  name: 'Busca em Profundidade',
  shortSummary: 'Mergulha em um ramo até o fim antes de tentar outro, usando uma pilha LIFO.',
  frontierKind: 'stack',
  run,
  narrate,
  theory,
  code,
};
