import type { AlgorithmDefinition } from '../../simulation/types';
import { run } from './run';
import { narrate } from './narration';
import { theory } from './theory';

export const uniformCost: AlgorithmDefinition = {
  id: 'uniformCost',
  name: 'Busca Ordenada (Custo Uniforme)',
  shortSummary: 'Expande sempre o nó de menor custo acumulado g(n). Garante o caminho mais barato.',
  frontierKind: 'priority',
  run,
  narrate,
  theory,
};
