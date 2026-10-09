import type { TreeState } from '../domain/tree/api';
import type { CatalogIndex } from '../domain/tree/catalogIndex';
import { homeAreaOf } from '../domain/tree/catalogIndex';
import { levelName } from '../domain/tree/levels';
import {
  dependents,
  explainRequirements,
  isRequirementMet,
  type RequirementGroupView,
  type RequirementItemView,
} from '../domain/tree/requirements';
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

export type RequirementItem = RequirementItemView & { otherArea?: { name: string; color: string } };
export type RequirementGroup = Omit<RequirementGroupView, 'items'> & { items: RequirementItem[] };

export interface NodeView {
  node: NodeDef;
  state: NodeState;
  level: number;
  homeArea: { slug: string; name: string; color: string };
  homeBranch: { key: string; name: string };
  /** Selecionado numa branch que não é a casa. */
  mirror: boolean;
  requirements: RequirementGroup[];
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
  return `${head} · ${freed.join(', ')} ${freed.length === 1 ? 'liberada' : 'liberadas'}`;
}

export function levelTitle(level: number): string {
  return `Nível ${level} · ${levelName(level)}`;
}

// ── Carrossel ─────────────────────────────────────────────────────────────

export interface CarouselLayout {
  cardWidth: number;
  gap: number;
}

/** Carta entre 240 e 400px (32% da tela). Como o protótipo. */
export function carouselLayout(viewport: number): CarouselLayout {
  return { cardWidth: Math.min(400, Math.max(240, viewport * 0.32)), gap: viewport < 640 ? 0 : 12 };
}

/** Índice dentro de 0..n-1, dando a volta nos dois sentidos. */
export function wrapIndex(i: number, n: number): number {
  return n === 0 ? 0 : ((i % n) + n) % n;
}

/**
 * Distância circular da carta `i` até a central, em (−n/2, n/2]: o carrossel
 * não tem fim, então a última carta fica à esquerda da primeira.
 */
export function circularOffset(i: number, current: number, n: number): number {
  const d = wrapIndex(i - current, n);
  return d > n / 2 ? d - n : d;
}

export function cardPosition(i: number, current: number, n: number): 'on' | 'near' | 'far' {
  const d = Math.abs(circularOffset(i, current, n));
  return d === 0 ? 'on' : d === 1 ? 'near' : 'far';
}

/** Primeira branch da área que tem nós; é onde o carrossel abre. */
export function firstBranchWithNodes(index: CatalogIndex, area: string): number {
  const branches = index.branchesByArea.get(area) ?? [];
  return Math.max(0, branches.findIndex((b) => (index.placementsByBranch.get(b.key) ?? []).length > 0));
}

/** O que um nó libera e a partir de qual nível ("Ao chegar no nível 2, Sliding Window é liberada"). */
export function unlockHints(index: CatalogIndex, slug: string): { title: string; minLevel: number }[] {
  return index.catalog.nodes.flatMap((n) =>
    n.requires.filter((r) => r.node === slug && r.strength === 'obrigatorio').map((r) => ({ title: n.title, minLevel: r.minLevel })),
  );
}

// ── Câmera da constelação ─────────────────────────────────────────────────

export interface CameraShot {
  zoom: number;
  /** Inclinação em X, em graus: o topo da constelação recua, como no Skyrim. */
  tilt: number;
}

/** Aproximar para ver a estrela selecionada; mergulhar ao abrir a habilidade. */
export const CAMERA_FOCUS: CameraShot = { zoom: 1.75, tilt: 12 };
export const CAMERA_DIVE: CameraShot = { zoom: 6, tilt: 20 };

export type ViewBox = [x: number, y: number, width: number, height: number];

/**
 * viewBox do SVG para a câmera. O zoom é feito no próprio SVG (e não com
 * scale em CSS) para os vetores serem redesenhados nítidos em qualquer zoom.
 *
 * O viewBox tem a proporção da cena (`box`, em px), então a conversão é
 * exata: sem estrela, a constelação inteira cabe centralizada (como o "meet");
 * com estrela, ela fica no ponto `target` da cena, aproximada `zoom` vezes.
 */
export function cameraViewBox(
  star: { cx: number; cy: number } | null,
  box: { width: number; height: number },
  target: { x: number; y: number },
  zoom: number,
): ViewBox {
  const fit = Math.min(box.width / SKY_W, box.height / SKY_H);
  const r = (n: number) => Math.round(n * 100) / 100;
  if (!star || fit <= 0) {
    const w = box.width / fit;
    const h = box.height / fit;
    return fit > 0 ? [r((SKY_W - w) / 2), r((SKY_H - h) / 2), r(w), r(h)] : [0, 0, SKY_W, SKY_H];
  }
  const scale = fit * zoom;
  return [r(star.cx - target.x / scale), r(star.cy - target.y / scale), r(box.width / scale), r(box.height / scale)];
}

// ── Rótulos das estrelas ──────────────────────────────────────────────────

/** Tamanho do rótulo na constelação expandida, em unidades do viewBox. */
export const LABEL_FONT = 12.5;

export interface LabelPlacement {
  x: number;
  /** Linha de base do nome; o rótulo de espelho vai logo abaixo. */
  y: number;
  anchor: 'middle' | 'start' | 'end';
}

type Rect = { x0: number; y0: number; x1: number; y1: number };
type Side = 'below' | 'right' | 'left' | 'above';

/** Preferência: embaixo (o padrão do protótipo), depois dos lados, por último em cima. */
const SIDE_COST: Record<Side, number> = { below: 0, right: 0.6, left: 0.6, above: 0.9 };

function overlaps(a: Rect, b: Rect): boolean {
  return a.x0 < b.x1 && b.x0 < a.x1 && a.y0 < b.y1 && b.y0 < a.y1;
}

/** O segmento cruza o retângulo? (Liang–Barsky.) */
function segmentHitsRect(x1: number, y1: number, x2: number, y2: number, r: Rect): boolean {
  let t0 = 0;
  let t1 = 1;
  const dx = x2 - x1;
  const dy = y2 - y1;
  const clip = (p: number, q: number) => {
    if (p === 0) return q >= 0;
    const t = q / p;
    if (p < 0) {
      if (t > t1) return false;
      if (t > t0) t0 = t;
    } else {
      if (t < t0) return false;
      if (t < t1) t1 = t;
    }
    return true;
  };
  return clip(-dx, x1 - r.x0) && clip(dx, r.x1 - x1) && clip(-dy, y1 - r.y0) && clip(dy, r.y1 - y1);
}

/**
 * Onde desenhar o nome de cada estrela para não ficar por cima de linhas,
 * de outras estrelas nem de outros nomes. Testa embaixo, à direita, à
 * esquerda e em cima, e fica com o lado de menor custo. A largura do texto é
 * estimada (sem medir no DOM), o que basta para evitar as colisões visíveis.
 */
export function placeLabels(stars: StarView[], edges: EdgeView[], font = LABEL_FONT): Record<string, LabelPlacement> {
  const lineH = font * 1.25;
  const starRects: Rect[] = stars.map((s) => ({ x0: s.cx - s.r - 3, y0: s.cy - s.r - 3, x1: s.cx + s.r + 3, y1: s.cy + s.r + 3 }));
  const placed: Rect[] = [];
  const out: Record<string, LabelPlacement> = {};

  stars.forEach((star, i) => {
    const width = star.title.length * font * 0.55;
    const height = star.mirror ? lineH * 2 : lineH;
    const gap = 8;
    const candidates: { side: Side; place: LabelPlacement; rect: Rect }[] = [
      {
        side: 'below',
        place: { x: star.cx, y: star.cy + star.r + gap + font, anchor: 'middle' },
        rect: { x0: star.cx - width / 2, y0: star.cy + star.r + gap, x1: star.cx + width / 2, y1: star.cy + star.r + gap + height },
      },
      {
        side: 'right',
        place: { x: star.cx + star.r + gap, y: star.cy + font * 0.35, anchor: 'start' },
        rect: { x0: star.cx + star.r + gap, y0: star.cy - lineH / 2, x1: star.cx + star.r + gap + width, y1: star.cy - lineH / 2 + height },
      },
      {
        side: 'left',
        place: { x: star.cx - star.r - gap, y: star.cy + font * 0.35, anchor: 'end' },
        rect: { x0: star.cx - star.r - gap - width, y0: star.cy - lineH / 2, x1: star.cx - star.r - gap, y1: star.cy - lineH / 2 + height },
      },
      {
        side: 'above',
        place: { x: star.cx, y: star.cy - star.r - gap - (height - lineH) - font * 0.3, anchor: 'middle' },
        rect: { x0: star.cx - width / 2, y0: star.cy - star.r - gap - height, x1: star.cx + width / 2, y1: star.cy - star.r - gap },
      },
    ];

    let best = candidates[0];
    let bestCost = Infinity;
    for (const c of candidates) {
      let cost = SIDE_COST[c.side];
      for (const e of edges) if (segmentHitsRect(e.x1, e.y1, e.x2, e.y2, c.rect)) cost += 2;
      starRects.forEach((r, j) => {
        if (j !== i && overlaps(c.rect, r)) cost += 3;
      });
      for (const r of placed) if (overlaps(c.rect, r)) cost += 4;
      if (c.rect.x0 < 0 || c.rect.x1 > SKY_W || c.rect.y0 < 0 || c.rect.y1 > SKY_H) cost += 1.5;
      if (cost < bestCost) {
        best = c;
        bestCost = cost;
      }
    }
    placed.push(best.rect);
    out[star.slug] = best.place;
  });
  return out;
}
