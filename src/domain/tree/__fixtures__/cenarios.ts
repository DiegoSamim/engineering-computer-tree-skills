import type { Catalog, NodeState } from '../types.ts';
import { exemploCatalog, exemploComRequisitoDeBranch } from './exemplo.ts';

/**
 * Os cenários de `docs/db/test_schema.py` como dados. O mesmo roteiro roda
 * contra a derivação em TypeScript e contra as views SQL; os dois lados
 * precisam produzir exatamente os mesmos estados.
 *
 * `set` imita o `set_level` do Python: grava o nível (marcando o nó como
 * iniciado) e registra um evento de 10 XP.
 */
export type ScenarioStep =
  | { kind: 'set'; node: string; level: number }
  | { kind: 'expect'; states: Record<string, NodeState> }
  | { kind: 'expectBranch'; branch: string; done: number; total: number }
  | { kind: 'expectXp'; xp: Record<string, number> };

export interface Scenario {
  name: string;
  catalog: () => Catalog;
  steps: ScenarioStep[];
}

export const SET_LEVEL_XP = 10;

export const SCENARIOS: Scenario[] = [
  {
    name: 'desbloqueio, OU, entre áreas, nível mínimo, espelho e XP',
    catalog: exemploCatalog,
    steps: [
      // Início: só nós sem requisito estão disponíveis.
      { kind: 'expect', states: { arrays: 'disponivel', 'big-o': 'disponivel', hashing: 'bloqueado', 'two-pointers': 'bloqueado' } },
      // Arrays feito: Two Pointers ainda exige (Ordenação OU Hashing).
      { kind: 'set', node: 'arrays', level: 1 },
      { kind: 'expect', states: { hashing: 'disponivel', 'two-pointers': 'bloqueado' } },
      // Hashing nível 1 satisfaz o grupo OU. Big-O é só recomendado: não bloqueia.
      { kind: 'set', node: 'hashing', level: 1 },
      { kind: 'expect', states: { 'two-pointers': 'disponivel', 'consistent-hashing': 'disponivel', 'indice-hash': 'bloqueado' } },
      // Índice hash (Dados) exige Hashing nível 2.
      { kind: 'set', node: 'hashing', level: 2 },
      { kind: 'expect', states: { 'indice-hash': 'disponivel' } },
      // Nível mínimo: Sliding Window exige Two Pointers nível 2.
      { kind: 'set', node: 'two-pointers', level: 1 },
      { kind: 'expect', states: { 'two-pointers': 'em_progresso', 'sliding-window': 'bloqueado' } },
      { kind: 'set', node: 'two-pointers', level: 3 },
      { kind: 'expect', states: { 'two-pointers': 'dominado', 'sliding-window': 'disponivel' } },
      // Espelho: Hashing conta na carta de Indexação.
      { kind: 'expectBranch', branch: 'dados/indexacao', done: 1, total: 2 },
      // XP vai só para a área-casa, nunca duplicado pelo espelho.
      { kind: 'expectXp', xp: { fund: 50 } },
    ],
  },
  {
    name: 'requisito de branch inteira exige todo o tronco',
    catalog: exemploComRequisitoDeBranch,
    steps: [
      { kind: 'set', node: 'arrays', level: 3 },
      { kind: 'set', node: 'hashing', level: 3 },
      { kind: 'set', node: 'two-pointers', level: 3 },
      { kind: 'expect', states: { 'sliding-window': 'bloqueado' } },
      // Big-O é o tronco de Complexidade.
      { kind: 'set', node: 'big-o', level: 1 },
      { kind: 'expect', states: { 'sliding-window': 'disponivel' } },
    ],
  },
];
