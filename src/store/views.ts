import type { TreeState } from '../domain/tree/api';
import type { CatalogIndex } from '../domain/tree/catalogIndex';
import { homeAreaOf } from '../domain/tree/catalogIndex';
import { levelName } from '../domain/tree/levels';
import { dependents, explainRequirements, isRequirementMet, type RequirementGroupView } from '../domain/tree/requirements';
import type { NodeDef, NodeState, PlacementRole, ProgressMap } from '../domain/tree/types';

/**
 * Dados de tela montados a partir do catálogo, do estado da API e do domínio.
 * Funções puras: os componentes só desenham o que sai daqui.
 */

export function progressFromState(state: TreeState): ProgressMap {
  const progress: ProgressMap = {};
  for (const [slug, n] of Object.entries(state.nodes)) progress[slug] = { level: n.level, started: n.startedAt !== null };
  return progress;
}

export function nodeStateOf(state: TreeState, slug: string): NodeState {
  return state.nodes[slug]?.state ?? 'bloqueado';
}

// ── Constelação ───────────────────────────────────────────────────────────

/** viewBox da constelação e o mapeamento de x/y (0–1) para ele, como no protótipo. */
export const SKY_W = 600;
export const SKY_H = 520;
export const px = (x: number) => 50 + x * 500;
export const py = (y: number) => 34 + y * 440;

export interface StarView {
  slug: string;
  title: string;
  role: PlacementRole;
  cx: number;
  cy: number;
  r: number;
  state: NodeState;
  level: number;
  maxLevel: number;
  planned: boolean;
  /** Nó desenhado fora da casa. */
  mirror: boolean;
  /** Cor da área-casa (o anel do espelho usa ela). */
  homeColor: string;
  homeBranchName: string;
}

export interface EdgeView {
  key: string;
  from: string;
  to: string;
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  /** Requisito cumprido. */
  lit: boolean;
  /** Alternativa de um grupo OU. */
  alt: boolean;
}

export interface ConstellationView {
  stars: StarView[];
  edges: EdgeView[];
}

/**
 * Estrelas e linhas de uma branch. As linhas SÃO os requisitos obrigatórios
 * entre nós desenhados na mesma branch; recomendados e requisitos de branch
 * inteira não desenham linha.
 */
export function constellationView(index: CatalogIndex, state: TreeState, branchKey: string, big: boolean): ConstellationView {
  const placements = index.placementsByBranch.get(branchKey) ?? [];
  const pos = new Map(placements.map((p) => [p.node, p]));
  const progress = progressFromState(state);

  const edges: EdgeView[] = [];
  for (const p of placements) {
    const node = index.nodes.get(p.node);
    if (!node) continue;
    for (const req of node.requires) {
      if (req.strength !== 'obrigatorio' || req.node === undefined) continue;
      const from = pos.get(req.node);
      if (!from) continue;
      edges.push({
        key: `${req.node}->${node.slug}`,
        from: req.node,
        to: node.slug,
        x1: px(from.x),
        y1: py(from.y),
        x2: px(p.x),
        y2: py(p.y),
        lit: isRequirementMet(index, req, progress),
        alt: req.group !== undefined,
      });
    }
  }

  const stars: StarView[] = placements.flatMap((p) => {
    const node = index.nodes.get(p.node);
    if (!node) return [];
    const view = state.nodes[node.slug];
    const trunk = p.role === 'tronco';
    return [
      {
        slug: node.slug,
        title: node.title,
        role: p.role,
        cx: px(p.x),
        cy: py(p.y),
        r: big ? (trunk ? 12 : 9) : trunk ? 13 : 10,
        state: view?.state ?? 'bloqueado',
        level: view?.level ?? 0,
        maxLevel: node.maxLevel,
        planned: node.content === 'planejado',
        mirror: node.home !== branchKey,
        homeColor: homeAreaOf(index, node)?.color ?? '',
        homeBranchName: index.branches.get(node.home)?.name ?? node.home,
      },
    ];
  });

  return { stars, edges };
}

// ── Painel e cabeçalho do nó ──────────────────────────────────────────────

export interface UnlockView {
  slug: string;
  title: string;
  /** Preenchido quando o nó liberado é de outra área. */
  otherArea?: { name: string; color: string };
}

export interface NodeView {
  node: NodeDef;
  state: NodeState;
  level: number;
  homeArea: { slug: string; name: string; color: string };
  homeBranch: { key: string; name: string };
  /** Selecionado numa branch que não é a casa. */
  mirror: boolean;
  requirements: (RequirementGroupView & { items: (RequirementGroupView['items'][number] & { otherArea?: { name: string; color: string } })[] })[];
  unlocks: UnlockView[];
}

function otherArea(index: CatalogIndex, area: string | undefined, home: string) {
  if (!area || area === home) return undefined;
  const a = index.areas.get(area);
  return a ? { name: a.name, color: a.color } : undefined;
}

export function nodeView(index: CatalogIndex, state: TreeState, slug: string, viewedFrom?: string): NodeView | null {
  const node = index.nodes.get(slug);
  if (!node) return null;
  const branch = index.branches.get(node.home);
  const area = branch ? index.areas.get(branch.area) : undefined;
  if (!branch || !area) return null;
  const progress = progressFromState(state);

  return {
    node,
    state: nodeStateOf(state, slug),
    level: state.nodes[slug]?.level ?? 0,
    homeArea: { slug: area.slug, name: area.name, color: area.color },
    homeBranch: { key: branch.key, name: branch.name },
    mirror: viewedFrom !== undefined && viewedFrom !== node.home,
    requirements: explainRequirements(index, node, progress).map((g) => ({
      ...g,
      items: g.items.map((item) => ({ ...item, otherArea: otherArea(index, item.area, area.slug) })),
    })),
    unlocks: dependents(index, slug).map((s) => {
      const other = index.nodes.get(s)!;
      return { slug: s, title: other.title, otherArea: otherArea(index, index.branches.get(other.home)?.area, area.slug) };
    }),
  };
}

export interface RequireLinePart {
  met: boolean;
  label: string;
}

/** A linha "Requer ✓ Arrays · ✓ Ordenação ou Hash Map" da página do nó (só obrigatórios). */
export function requireLine(view: NodeView): RequireLinePart[] {
  return view.requirements
    .filter((g) => g.strength === 'obrigatorio')
    .map((g) => ({
      met: g.met,
      label: g.items
        .map((i) => (i.target.type === 'node' ? i.target.title : `Branch ${i.target.name}`) + (i.minLevel > 1 ? ` nível ${i.minLevel}` : ''))
        .join(' ou '),
    }));
}

// ── Aviso de mudança de nível ─────────────────────────────────────────────

/**
 * Mensagem para o toast depois de um evento num nó: subiu ou desceu de nível,
 * e quais nós foram liberados. Null quando o nível não mudou.
 */
export function levelChangeMessage(index: CatalogIndex, before: TreeState, after: TreeState, slug: string): string | null {
  const from = before.nodes[slug]?.level ?? 0;
  const to = after.nodes[slug]?.level ?? 0;
  if (from === to) return null;
  if (to < from) return to === 0 ? 'Voltou ao nível 0' : `Voltou ao nível ${to}`;

  const freed = Object.keys(after.nodes)
    .filter((s) => before.nodes[s]?.state === 'bloqueado' && after.nodes[s]?.state !== 'bloqueado')
    .map((s) => index.nodes.get(s)?.title ?? s);
  const head = `Nível ${to} atingido`;
  if (freed.length === 0) return head;
  return `${head} · ${freed.join(', ')} ${freed.length === 1 ? 'liberado' : 'liberados'}`;
}

export function levelTitle(level: number): string {
  return `Nível ${level} · ${levelName(level)}`;
}

// ── Carrossel ─────────────────────────────────────────────────────────────

export interface CarouselLayout {
  cardWidth: number;
  gap: number;
  /** translateX da trilha para centralizar a carta `current`. */
  offset: number;
}

/** Carta entre 240 e 400px (32% da tela), centralizada. Como o protótipo. */
export function carouselLayout(viewport: number, current: number): CarouselLayout {
  const cardWidth = Math.min(400, Math.max(240, viewport * 0.32));
  const gap = viewport < 640 ? 0 : 12;
  return { cardWidth, gap, offset: viewport / 2 - (current * (cardWidth + gap) + cardWidth / 2) };
}

export function cardPosition(i: number, current: number): 'on' | 'near' | 'far' {
  if (i === current) return 'on';
  return Math.abs(i - current) === 1 ? 'near' : 'far';
}

/** Primeira branch da área que tem nós; é onde o carrossel abre. */
export function firstBranchWithNodes(index: CatalogIndex, area: string): number {
  const branches = index.branchesByArea.get(area) ?? [];
  return Math.max(0, branches.findIndex((b) => (index.placementsByBranch.get(b.key) ?? []).length > 0));
}
