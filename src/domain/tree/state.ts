import type { CatalogIndex } from './catalogIndex.ts';
import { isUnlocked } from './requirements.ts';
import type { NodeDef, NodeProgress, NodeState, ProgressMap } from './types.ts';

const NOT_STARTED: NodeProgress = { level: 0, started: false };

/** Mesma precedência de `v_node_state`: nível vence requisito. */
export function deriveNodeState(node: NodeDef, progress: NodeProgress | undefined, unlocked: boolean): NodeState {
  const { level, started } = progress ?? NOT_STARTED;
  if (level >= node.maxLevel) return 'dominado';
  if (level >= 1) return 'em_progresso';
  if (started) return 'estudando';
  return unlocked ? 'disponivel' : 'bloqueado';
}

export function deriveStates(index: CatalogIndex, progress: ProgressMap): Record<string, NodeState> {
  const states: Record<string, NodeState> = {};
  for (const node of index.catalog.nodes) {
    states[node.slug] = deriveNodeState(node, progress[node.slug], isUnlocked(index, node, progress));
  }
  return states;
}
