import type { AlgorithmDefinition } from '../../simulation/types';
import { run } from './run';
import { narrate } from './narration';
import { theory } from './theory';

export const backtracking: AlgorithmDefinition = {
  id: 'backtracking',
  name: 'Backtracking',
  shortSummary: 'Constrói uma solução passo a passo, desfazendo decisões que não funcionam.',
  frontierKind: 'decision-point',
  run,
  narrate,
  theory,
};
