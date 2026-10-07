import type { AlgorithmDefinition } from '../../simulation/types';
import { run } from './run';
import { narrate } from './narration';
import { theory } from './theory';
import { code } from './code';

export const bfs: AlgorithmDefinition = {
  id: 'bfs',
  name: 'Busca em Largura',
  shortSummary: 'Explora nível por nível, usando uma fila FIFO.',
  frontierKind: 'queue',
  run,
  narrate,
  theory,
  code,
};
