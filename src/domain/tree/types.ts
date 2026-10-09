/**
 * Modelo de domínio da skill tree: Área → Branch → Nó.
 *
 * Este módulo é importado pelo navegador, pelo servidor e pelo script de
 * catálogo. O servidor roda TypeScript com `--experimental-strip-types`, então
 * aqui só vale sintaxe apagável: imports com extensão `.ts`, nada de `enum`,
 * `namespace` ou parameter properties.
 */

export const NODE_KINDS = ['padrao', 'conceito', 'ferramenta', 'caso'] as const;
export type NodeKind = (typeof NODE_KINDS)[number];

export const CONTENT_STATUSES = ['planejado', 'rascunho', 'publicado'] as const;
export type ContentStatus = (typeof CONTENT_STATUSES)[number];

export const PLACEMENT_ROLES = ['tronco', 'lateral'] as const;
export type PlacementRole = (typeof PLACEMENT_ROLES)[number];

export const REQUIREMENT_STRENGTHS = ['obrigatorio', 'recomendado'] as const;
export type RequirementStrength = (typeof REQUIREMENT_STRENGTHS)[number];

export const RELATION_TYPES = ['compara_com', 'aplica_em', 'ver_tambem'] as const;
export type RelationType = (typeof RELATION_TYPES)[number];

export const DIFFICULTIES = ['facil', 'medio', 'dificil'] as const;
export type Difficulty = (typeof DIFFICULTIES)[number];

/** Uma figura por área (docs/design-system/README.md, Iconografia). */
export const AREA_ICONS = [
  'capelo',
  'chip',
  'nuvem',
  'cilindro',
  'escudo',
  'engrenagem',
  'codigo',
  'rede',
  'faisca',
  'blocos',
] as const;
export type AreaIcon = (typeof AREA_ICONS)[number];

/** Estado que a tela pinta. Derivado, nunca gravado. */
export const NODE_STATES = ['bloqueado', 'disponivel', 'estudando', 'em_progresso', 'dominado'] as const;
export type NodeState = (typeof NODE_STATES)[number];

// ── Catálogo ────────────────────────────────────────────────────────────────

export interface AreaDef {
  slug: string;
  name: string;
  /** Subtítulo curto ("Bases teóricas"). */
  sub?: string;
  description?: string;
  color: string;
  icon: AreaIcon;
  position: number;
}

export interface BranchDef {
  /** Chave pública: `area/branch`. */
  key: string;
  area: string;
  slug: string;
  name: string;
  description?: string;
  /** Ordem no carrossel da área. */
  position: number;
}

/** Onde o nó é desenhado numa branch. Branch ≠ casa = espelho. */
export interface PlacementDef {
  branch: string;
  role: PlacementRole;
  x: number;
  y: number;
}

/** "Este nó exige X". X é um nó OU uma branch inteira (= o tronco dela). */
export interface RequirementDef {
  node?: string;
  branch?: string;
  minLevel: number;
  strength: RequirementStrength;
  /** Mesmo grupo no mesmo nó = OU. Sem grupo = E. */
  group?: number;
}

export interface RelationDef {
  node: string;
  type: RelationType;
}

export interface CriterionDef {
  /** Estável: o progresso depende dele. */
  id: string;
  level: number;
  label: string;
  text: string;
}

export interface ExerciseDef {
  id: string;
  title: string;
  url?: string;
  difficulty?: Difficulty;
}

export interface NodeDef {
  slug: string;
  title: string;
  /** Branch-casa (`area/branch`). */
  home: string;
  kind: NodeKind;
  content: ContentStatus;
  maxLevel: number;
  estMinutes?: number;
  summary?: string;
  /** Casa primeiro, espelhos depois. */
  placements: PlacementDef[];
  requires: RequirementDef[];
  related: RelationDef[];
  criteria: CriterionDef[];
  exercises: ExerciseDef[];
  /** Chave no registry de visualizadores. */
  visualizer?: string;
  /** Arquivo do corpo do conteúdo, quando existe. */
  contentPath?: string;
}

export interface Catalog {
  areas: AreaDef[];
  branches: BranchDef[];
  nodes: NodeDef[];
}

// ── Progresso ───────────────────────────────────────────────────────────────

/** O que a derivação de estado precisa saber de um nó. */
export interface NodeProgress {
  level: number;
  started: boolean;
}

/** Progresso por slug. Nó ausente = nível 0, não iniciado. */
export type ProgressMap = Record<string, NodeProgress | undefined>;

/** Um evento com XP, para somar por área. */
export interface XpEvent {
  node: string;
  xp: number;
}

export const EVENT_TYPES = [
  'iniciou',
  'criterio_marcado',
  'criterio_desmarcado',
  'guia_lida',
  'guia_desmarcada',
  'exercicio_tentado',
  'exercicio_resolvido',
  'exercicio_desmarcado',
  'sessao_estudo',
] as const;
export type EventType = (typeof EVENT_TYPES)[number];

/** O que o cliente envia para `POST /api/events`. */
export type ProgressEventInput =
  | { type: 'iniciou'; node: string }
  | { type: 'criterio_marcado' | 'criterio_desmarcado'; node: string; criterion: string }
  | { type: 'guia_lida' | 'guia_desmarcada'; node: string; guide: string }
  | { type: 'exercicio_tentado' | 'exercicio_resolvido' | 'exercicio_desmarcado'; node: string; exercise: string }
  | { type: 'sessao_estudo'; node: string; seconds: number };
