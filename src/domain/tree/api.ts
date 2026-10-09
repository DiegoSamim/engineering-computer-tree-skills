import type { BranchProgress, Count } from './counters.ts';
import type { ProgressEventInput, NodeState } from './types.ts';

/**
 * Contrato da API entre servidor e navegador. Só tipos: o servidor monta
 * estes objetos a partir das views SQL, e o front só os lê.
 */

export interface NodeStateView {
  level: number;
  state: NodeState;
  startedAt: string | null;
  completedAt: string | null;
  secondsStudied: number;
  /** Ids dos critérios marcados. */
  criteria: string[];
  /** Ids das guias lidas. */
  guides: string[];
  /** Por id de exercício. */
  exercises: Record<string, { attempts: number; solvedAt: string | null }>;
}

export interface TreeState {
  user: { displayName: string | null };
  /** Contador global: nós com nível ≥ 1 / todos os nós. */
  totals: Count;
  areas: Record<string, Count & { xp: number }>;
  branches: Record<string, BranchProgress>;
  nodes: Record<string, NodeStateView>;
}

/** Resposta de `POST /api/events`. `recorded` é falso quando o evento não mudou nada. */
export interface EventResponse {
  recorded: boolean;
  state: TreeState;
}

export type StoredEvent = ProgressEventInput & { occurredAt: string };

export interface ExportPayload {
  version: 1;
  events: StoredEvent[];
}
