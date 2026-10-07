import type { AlgorithmDefinition } from '../../simulation/types';
import { run } from './run';
import { narrate } from './narration';
import { theory } from './theory';

export const greedy: AlgorithmDefinition = {
  id: 'greedy',
  name: 'Busca Gulosa (Greedy Best-First)',
  shortSummary: 'Escolhe sempre o nó que parece mais perto do objetivo, guiada só por h(n).',
  frontierKind: 'priority',
  run,
  narrate,
  theory,
};
