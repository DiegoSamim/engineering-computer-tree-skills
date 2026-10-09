import type { AreaDef, BranchDef, Catalog, NodeDef, PlacementRole } from './types.ts';

export interface BranchPlacement {
  node: string;
  role: PlacementRole;
  x: number;
  y: number;
}

/** Índices do catálogo, montados uma vez e consultados por todo o domínio. */
export interface CatalogIndex {
  catalog: Catalog;
  areas: Map<string, AreaDef>;
  branches: Map<string, BranchDef>;
  nodes: Map<string, NodeDef>;
  /** Placements por branch, na ordem de declaração (casa e espelhos). */
  placementsByBranch: Map<string, BranchPlacement[]>;
  /** Nós de tronco por branch: o alvo de um requisito de branch inteira. */
  trunkByBranch: Map<string, string[]>;
  /** Branches de cada área, na ordem de `position`. */
  branchesByArea: Map<string, BranchDef[]>;
}

export function indexCatalog(catalog: Catalog): CatalogIndex {
  const areas = new Map(catalog.areas.map((a) => [a.slug, a]));
  const branches = new Map(catalog.branches.map((b) => [b.key, b]));
  const nodes = new Map(catalog.nodes.map((n) => [n.slug, n]));

  const placementsByBranch = new Map<string, BranchPlacement[]>();
  const trunkByBranch = new Map<string, string[]>();
  for (const node of catalog.nodes) {
    for (const p of node.placements) {
      const list = placementsByBranch.get(p.branch) ?? [];
      list.push({ node: node.slug, role: p.role, x: p.x, y: p.y });
      placementsByBranch.set(p.branch, list);
      if (p.role === 'tronco') {
        const trunk = trunkByBranch.get(p.branch) ?? [];
        trunk.push(node.slug);
        trunkByBranch.set(p.branch, trunk);
      }
    }
  }

  const branchesByArea = new Map<string, BranchDef[]>();
  for (const branch of [...catalog.branches].sort((a, b) => a.position - b.position)) {
    const list = branchesByArea.get(branch.area) ?? [];
    list.push(branch);
    branchesByArea.set(branch.area, list);
  }

  return { catalog, areas, branches, nodes, placementsByBranch, trunkByBranch, branchesByArea };
}

/** Área-casa de um nó. */
export function homeAreaOf(index: CatalogIndex, node: NodeDef): AreaDef | undefined {
  const branch = index.branches.get(node.home);
  return branch ? index.areas.get(branch.area) : undefined;
}
