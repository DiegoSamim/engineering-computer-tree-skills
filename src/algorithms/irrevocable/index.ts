import type { AlgorithmDefinition } from '../../simulation/types';
import { run } from './run';
import { narrate } from './narration';
import { theory } from './theory';

export const irrevocable: AlgorithmDefinition = {
  id: 'irrevocable',
  name: 'Busca Irreversível',
  shortSummary: 'Escolhe o menor custo de aresta imediato e nunca reconsidera. Pode falhar mesmo havendo solução.',
  frontierKind: 'path',
  run,
  narrate,
  theory,
};
