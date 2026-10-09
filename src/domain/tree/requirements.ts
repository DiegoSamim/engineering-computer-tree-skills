import type { CatalogIndex } from './catalogIndex.ts';
import type { NodeDef, ProgressMap, RequirementDef, RequirementStrength } from './types.ts';

export function levelOf(progress: ProgressMap, slug: string): number {
  return progress[slug]?.level ?? 0;
}

/**
 * Um requisito está cumprido quando o alvo atinge o nível mínimo. Alvo de
 * branch = todos os nós de tronco dela; branch sem tronco é cumprida por
 * vacuidade, igual a `v_requirement_met`.
 */
export function isRequirementMet(index: CatalogIndex, req: RequirementDef, progress: ProgressMap): boolean {
  if (req.node !== undefined) return levelOf(progress, req.node) >= req.minLevel;
  const trunk = index.trunkByBranch.get(req.branch ?? '') ?? [];
  return trunk.every((slug) => levelOf(progress, slug) >= req.minLevel);
}

/** Chave do grupo: requisitos sem grupo formam um grupo cada (E). */
function groupKey(req: RequirementDef, i: number): string {
  return req.group !== undefined ? `g${req.group}` : `solo${i}`;
}

/**
 * O nó está liberado quando todo grupo de requisitos obrigatórios tem pelo
 * menos um requisito cumprido. Recomendados nunca bloqueiam.
 */
export function isUnlocked(index: CatalogIndex, node: NodeDef, progress: ProgressMap): boolean {
  const groups = new Map<string, boolean>();
  node.requires.forEach((req, i) => {
    if (req.strength !== 'obrigatorio') return;
    const key = groupKey(req, i);
    groups.set(key, (groups.get(key) ?? false) || isRequirementMet(index, req, progress));
  });
  return [...groups.values()].every(Boolean);
}

export interface RequirementItemView {
  target: { type: 'node'; slug: string; title: string } | { type: 'branch'; key: string; name: string };
  minLevel: number;
  met: boolean;
  /** Área do alvo, para marcar requisitos entre áreas. */
  area?: string;
}

export interface RequirementGroupView {
  /** `ou` quando há alternativas; `e` para um requisito único. */
  kind: 'e' | 'ou';
  strength: RequirementStrength;
  met: boolean;
  items: RequirementItemView[];
}

/** Requisitos agrupados como a UI mostra: um item por E, alternativas juntas no OU. */
export function explainRequirements(index: CatalogIndex, node: NodeDef, progress: ProgressMap): RequirementGroupView[] {
  const groups = new Map<string, RequirementGroupView>();
  node.requires.forEach((req, i) => {
    const key = `${req.strength}:${groupKey(req, i)}`;
    const item = describeRequirement(index, req, progress);
    const group = groups.get(key);
    if (group) {
      group.kind = 'ou';
      group.items.push(item);
      group.met = group.met || item.met;
    } else {
      groups.set(key, { kind: 'e', strength: req.strength, met: item.met, items: [item] });
    }
  });
  return [...groups.values()];
}

function describeRequirement(index: CatalogIndex, req: RequirementDef, progress: ProgressMap): RequirementItemView {
  const met = isRequirementMet(index, req, progress);
  if (req.node !== undefined) {
    const target = index.nodes.get(req.node);
    const area = target ? index.branches.get(target.home)?.area : undefined;
    return { target: { type: 'node', slug: req.node, title: target?.title ?? req.node }, minLevel: req.minLevel, met, area };
  }
  const key = req.branch ?? '';
  const branch = index.branches.get(key);
  return { target: { type: 'branch', key, name: branch?.name ?? key }, minLevel: req.minLevel, met, area: branch?.area };
}

/** Nós que exigem `slug` como requisito obrigatório: o que ele "libera". */
export function dependents(index: CatalogIndex, slug: string): string[] {
  return index.catalog.nodes
    .filter((n) => n.requires.some((r) => r.node === slug && r.strength === 'obrigatorio'))
    .map((n) => n.slug);
}
