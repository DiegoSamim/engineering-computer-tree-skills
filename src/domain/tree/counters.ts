import type { CatalogIndex } from './catalogIndex.ts';
import { levelOf } from './requirements.ts';
import type { NodeState, ProgressMap, XpEvent } from './types.ts';

export interface BranchProgress {
  total: number;
  withContent: number;
  done: number;
  mastered: number;
  trunkTotal: number;
  trunkDone: number;
}

export interface Count {
  done: number;
  total: number;
}

/**
 * Contador da carta da branch ("9/16"), espelhos incluídos. Igual a
 * `v_branch_progress`, mas com zeros para branches sem nós.
 */
export function branchProgress(
  index: CatalogIndex,
  progress: ProgressMap,
  states: Record<string, NodeState>,
): Record<string, BranchProgress> {
  const out: Record<string, BranchProgress> = {};
  for (const key of index.branches.keys()) {
    const row: BranchProgress = { total: 0, withContent: 0, done: 0, mastered: 0, trunkTotal: 0, trunkDone: 0 };
    for (const p of index.placementsByBranch.get(key) ?? []) {
      const node = index.nodes.get(p.node);
      const done = levelOf(progress, p.node) >= 1;
      row.total++;
      if (node?.content === 'publicado') row.withContent++;
      if (done) row.done++;
      if (states[p.node] === 'dominado') row.mastered++;
      if (p.role === 'tronco') {
        row.trunkTotal++;
        if (done) row.trunkDone++;
      }
    }
    out[key] = row;
  }
  return out;
}

/** Nós concluídos (nível ≥ 1) por área-casa. Espelhos não contam duas vezes. */
export function areaProgress(index: CatalogIndex, progress: ProgressMap): Record<string, Count> {
  const out: Record<string, Count> = {};
  for (const slug of index.areas.keys()) out[slug] = { done: 0, total: 0 };
  for (const node of index.catalog.nodes) {
    const area = index.branches.get(node.home)?.area;
    if (!area || !out[area]) continue;
    out[area].total++;
    if (levelOf(progress, node.slug) >= 1) out[area].done++;
  }
  return out;
}

/** Contador global ("14 / 47 nós"). */
export function totalProgress(index: CatalogIndex, progress: ProgressMap): Count {
  const nodes = index.catalog.nodes;
  return { done: nodes.filter((n) => levelOf(progress, n.slug) >= 1).length, total: nodes.length };
}

/** XP por área-casa, como `v_area_xp`: só áreas com eventos aparecem. */
export function areaXp(index: CatalogIndex, events: XpEvent[]): Record<string, number> {
  const out: Record<string, number> = {};
  for (const event of events) {
    const node = index.nodes.get(event.node);
    const area = node ? index.branches.get(node.home)?.area : undefined;
    if (!area) continue;
    out[area] = (out[area] ?? 0) + event.xp;
  }
  return out;
}
