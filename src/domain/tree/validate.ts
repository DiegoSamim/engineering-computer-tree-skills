import { indexCatalog } from './catalogIndex.ts';
import { AREA_ICONS, type Catalog } from './types.ts';

/**
 * Códigos de erro. Os quatro primeiros são os de `docs/db/validate.sql`; o
 * servidor roda as mesmas checagens em SQL depois de semear, e os testes
 * garantem que as duas implementações acusam os mesmos casos.
 */
export type CatalogErrorCode =
  | 'ciclo'
  | 'sem_placement_na_casa'
  | 'grupo_ou_unitario'
  | 'min_level_impossivel'
  | 'area_duplicada'
  | 'branch_duplicada'
  | 'slug_duplicado'
  | 'area_inexistente'
  | 'branch_inexistente'
  | 'alvo_inexistente'
  | 'requisito_proprio'
  | 'requisito_duplicado'
  | 'requisito_sem_alvo'
  | 'nivel_invalido'
  | 'placement_duplicado'
  | 'coordenada_invalida'
  | 'max_level_invalido'
  | 'criterio_duplicado'
  | 'criterio_nivel_invalido'
  | 'nivel_sem_criterio'
  | 'publicado_sem_criterios'
  | 'branch_sem_tronco'
  | 'relacao_invalida'
  | 'exercicio_duplicado'
  | 'icone_invalido';

export interface CatalogError {
  code: CatalogErrorCode;
  message: string;
  /** Nó, branch ou área onde o erro está. */
  where?: string;
}

export function validateCatalog(catalog: Catalog): CatalogError[] {
  const errors: CatalogError[] = [];
  const err = (code: CatalogErrorCode, message: string, where?: string) => errors.push({ code, message, where });

  // ── Unicidade e referências de área/branch ──────────────────────────────
  const areaSlugs = new Set<string>();
  for (const area of catalog.areas) {
    if (areaSlugs.has(area.slug)) err('area_duplicada', `Área "${area.slug}" declarada duas vezes`, area.slug);
    areaSlugs.add(area.slug);
    if (!(AREA_ICONS as readonly string[]).includes(area.icon)) {
      err('icone_invalido', `Ícone "${area.icon}" desconhecido (use um de: ${AREA_ICONS.join(', ')})`, area.slug);
    }
  }

  const branchKeys = new Set<string>();
  for (const branch of catalog.branches) {
    if (branchKeys.has(branch.key)) err('branch_duplicada', `Branch "${branch.key}" declarada duas vezes`, branch.key);
    branchKeys.add(branch.key);
    if (!areaSlugs.has(branch.area)) err('area_inexistente', `Branch "${branch.key}" aponta para área inexistente`, branch.key);
  }

  const slugs = new Set<string>();
  for (const node of catalog.nodes) {
    if (slugs.has(node.slug)) err('slug_duplicado', `Nó "${node.slug}" declarado duas vezes`, node.slug);
    slugs.add(node.slug);
  }

  const index = indexCatalog(catalog);

  for (const node of catalog.nodes) {
    const at = node.slug;

    if (!branchKeys.has(node.home)) err('branch_inexistente', `Casa "${node.home}" não existe`, at);
    if (!Number.isInteger(node.maxLevel) || node.maxLevel < 1 || node.maxLevel > 5) {
      err('max_level_invalido', `max_level deve ser inteiro entre 1 e 5 (veio ${node.maxLevel})`, at);
    }

    // ── Placements ────────────────────────────────────────────────────────
    const placed = new Set<string>();
    for (const p of node.placements) {
      if (!branchKeys.has(p.branch)) err('branch_inexistente', `Placement em branch inexistente "${p.branch}"`, at);
      if (placed.has(p.branch)) err('placement_duplicado', `Dois placements na branch "${p.branch}"`, at);
      placed.add(p.branch);
      if (!(p.x >= 0 && p.x <= 1 && p.y >= 0 && p.y <= 1)) {
        err('coordenada_invalida', `Coordenadas fora de 0–1 em "${p.branch}" (${p.x}, ${p.y})`, at);
      }
    }
    if (!placed.has(node.home)) err('sem_placement_na_casa', `Nó não é desenhado na própria casa "${node.home}"`, at);

    // ── Requisitos ────────────────────────────────────────────────────────
    const seenTargets = new Set<string>();
    const groupSizes = new Map<number, number>();
    for (const req of node.requires) {
      if ((req.node === undefined) === (req.branch === undefined)) {
        err('requisito_sem_alvo', 'Requisito precisa de exatamente um alvo: node ou branch', at);
        continue;
      }
      const target = req.node !== undefined ? `node:${req.node}` : `branch:${req.branch}`;
      if (seenTargets.has(target)) err('requisito_duplicado', `Requisito repetido: ${target}`, at);
      seenTargets.add(target);

      if (!Number.isInteger(req.minLevel) || req.minLevel < 1) {
        err('nivel_invalido', `Nível mínimo inválido em ${target}`, at);
      }
      if (req.group !== undefined) groupSizes.set(req.group, (groupSizes.get(req.group) ?? 0) + 1);

      if (req.node !== undefined) {
        if (req.node === node.slug) err('requisito_proprio', 'Nó exige a si mesmo', at);
        const other = index.nodes.get(req.node);
        if (!other) err('alvo_inexistente', `Requisito aponta para nó inexistente "${req.node}"`, at);
        else if (req.minLevel > other.maxLevel) {
          err('min_level_impossivel', `${node.slug} -> ${req.node}: nível ${req.minLevel} acima do máximo ${other.maxLevel}`, at);
        }
      } else if (req.branch !== undefined) {
        if (!branchKeys.has(req.branch)) err('branch_inexistente', `Requisito aponta para branch inexistente "${req.branch}"`, at);
        else if ((index.trunkByBranch.get(req.branch) ?? []).length === 0) {
          err('branch_sem_tronco', `Branch "${req.branch}" não tem nós de tronco; o requisito seria sempre cumprido`, at);
        }
      }
    }
    for (const [group, size] of groupSizes) {
      if (size === 1) err('grupo_ou_unitario', `${node.slug} grupo ${group} tem um único requisito`, at);
    }

    // ── Critérios ─────────────────────────────────────────────────────────
    const criterionIds = new Set<string>();
    for (const c of node.criteria) {
      if (criterionIds.has(c.id)) err('criterio_duplicado', `Critério "${c.id}" repetido`, at);
      criterionIds.add(c.id);
      if (!Number.isInteger(c.level) || c.level < 1 || c.level > node.maxLevel) {
        err('criterio_nivel_invalido', `Critério "${c.id}" no nível ${c.level}, fora de 1–${node.maxLevel}`, at);
      }
    }
    if (node.criteria.length > 0) {
      for (let level = 1; level <= node.maxLevel; level++) {
        if (!node.criteria.some((c) => c.level === level)) {
          err('nivel_sem_criterio', `Nível ${level} não tem critério; ninguém chegaria aos seguintes`, at);
        }
      }
    } else if (node.content === 'publicado') {
      err('publicado_sem_criterios', 'Nó publicado precisa de critérios em todos os níveis', at);
    }

    // ── Relações e exercícios ─────────────────────────────────────────────
    for (const rel of node.related) {
      if (rel.node === node.slug || !index.nodes.has(rel.node)) {
        err('relacao_invalida', `Relação ${rel.type} aponta para "${rel.node}"`, at);
      }
    }
    const exerciseIds = new Set<string>();
    for (const e of node.exercises) {
      if (exerciseIds.has(e.id)) err('exercicio_duplicado', `Exercício "${e.id}" repetido`, at);
      exerciseIds.add(e.id);
    }
  }

  for (const cycle of findCycles(catalog)) {
    err('ciclo', `Ciclo de requisitos: ${cycle.join(' -> ')}`, cycle[0]);
  }

  return errors;
}

/**
 * Ciclos no grafo de requisitos (todas as forças, como `validate.sql`).
 * Requisito de branch expande para os nós de tronco dela.
 */
export function findCycles(catalog: Catalog): string[][] {
  const index = indexCatalog(catalog);
  const edges = new Map<string, string[]>();
  for (const node of catalog.nodes) {
    const out: string[] = [];
    for (const req of node.requires) {
      if (req.node !== undefined) out.push(req.node);
      else if (req.branch !== undefined) out.push(...(index.trunkByBranch.get(req.branch) ?? []));
    }
    edges.set(node.slug, out);
  }

  const cycles: string[][] = [];
  const color = new Map<string, 'cinza' | 'preto'>();
  const path: string[] = [];

  const visit = (slug: string) => {
    color.set(slug, 'cinza');
    path.push(slug);
    for (const next of edges.get(slug) ?? []) {
      if (!edges.has(next)) continue;
      const c = color.get(next);
      if (c === 'cinza') cycles.push([...path.slice(path.indexOf(next)), next]);
      else if (c === undefined) visit(next);
    }
    path.pop();
    color.set(slug, 'preto');
  };

  for (const slug of edges.keys()) if (!color.has(slug)) visit(slug);
  return cycles;
}
