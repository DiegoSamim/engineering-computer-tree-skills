import { branchKey } from './keys.ts';
import {
  AREA_ICONS,
  CONTENT_STATUSES,
  DIFFICULTIES,
  NODE_KINDS,
  PLACEMENT_ROLES,
  RELATION_TYPES,
  REQUIREMENT_STRENGTHS,
  type AreaDef,
  type AreaIcon,
  type BranchDef,
  type CriterionDef,
  type ExerciseDef,
  type NodeDef,
  type PlacementDef,
  type RelationDef,
  type RequirementDef,
} from './types.ts';

/**
 * Converte o YAML já lido (`_area.yaml`, `_branch.yaml`, `<no>.yaml`) nas
 * definições do catálogo. Puro: quem lê arquivos é `scripts/catalog/load.ts`.
 * Erros dizem o arquivo e o campo, para a mensagem do build ser acionável.
 */

export interface FieldError {
  file: string;
  field: string;
  message: string;
}

export type Parsed<T> = { value: T; errors: FieldError[] } | { value: null; errors: FieldError[] };

type Obj = Record<string, unknown>;

interface Ctx {
  file: string;
  errors: FieldError[];
}

function fail(ctx: Ctx, field: string, message: string): void {
  ctx.errors.push({ file: ctx.file, field, message });
}

function isObj(v: unknown): v is Obj {
  return typeof v === 'object' && v !== null && !Array.isArray(v);
}

function str(ctx: Ctx, obj: Obj, field: string, path = field): string | undefined {
  const v = obj[field];
  if (v === undefined || v === null) return undefined;
  if (typeof v !== 'string' || v.trim() === '') {
    fail(ctx, path, 'deve ser um texto não vazio');
    return undefined;
  }
  return v.trim();
}

function reqStr(ctx: Ctx, obj: Obj, field: string, path = field): string {
  const v = str(ctx, obj, field, path);
  if (v === undefined && (obj[field] === undefined || obj[field] === null)) fail(ctx, path, 'é obrigatório');
  return v ?? '';
}

function num(ctx: Ctx, obj: Obj, field: string, path = field): number | undefined {
  const v = obj[field];
  if (v === undefined || v === null) return undefined;
  if (typeof v !== 'number' || !Number.isFinite(v)) {
    fail(ctx, path, 'deve ser um número');
    return undefined;
  }
  return v;
}

function oneOf<T extends string>(ctx: Ctx, obj: Obj, field: string, options: readonly T[], fallback?: T, path = field): T {
  const v = obj[field];
  if ((v === undefined || v === null) && fallback !== undefined) return fallback;
  if (typeof v === 'string' && (options as readonly string[]).includes(v)) return v as T;
  fail(ctx, path, `deve ser um de: ${options.join(', ')}`);
  return fallback ?? options[0];
}

function list(ctx: Ctx, obj: Obj, field: string): Obj[] {
  const v = obj[field];
  if (v === undefined || v === null) return [];
  if (!Array.isArray(v)) {
    fail(ctx, field, 'deve ser uma lista');
    return [];
  }
  return v.flatMap((item, i) => {
    if (isObj(item)) return [item];
    fail(ctx, `${field}[${i}]`, 'deve ser um objeto');
    return [];
  });
}

function root(raw: unknown, ctx: Ctx): Obj | null {
  if (isObj(raw)) return raw;
  fail(ctx, '(arquivo)', 'deve conter um objeto YAML');
  return null;
}

function done<T>(value: T, ctx: Ctx): Parsed<T> {
  return ctx.errors.length > 0 ? { value: null, errors: ctx.errors } : { value, errors: [] };
}

// ── Área ──────────────────────────────────────────────────────────────────

export function parseArea(raw: unknown, file: string): Parsed<AreaDef> {
  const ctx: Ctx = { file, errors: [] };
  const obj = root(raw, ctx);
  if (!obj) return { value: null, errors: ctx.errors };

  const color = reqStr(ctx, obj, 'color');
  if (color && !/^#[0-9a-fA-F]{6}$/.test(color)) fail(ctx, 'color', 'deve ser uma cor #rrggbb');

  const area: AreaDef = {
    slug: reqStr(ctx, obj, 'slug'),
    name: reqStr(ctx, obj, 'name'),
    sub: str(ctx, obj, 'sub'),
    description: str(ctx, obj, 'description'),
    color,
    icon: oneOf<AreaIcon>(ctx, obj, 'icon', AREA_ICONS),
    position: num(ctx, obj, 'position') ?? 0,
  };
  if (obj.position === undefined) fail(ctx, 'position', 'é obrigatório');
  return done(area, ctx);
}

// ── Branch ────────────────────────────────────────────────────────────────

export function parseBranch(raw: unknown, area: string, file: string): Parsed<BranchDef> {
  const ctx: Ctx = { file, errors: [] };
  const obj = root(raw, ctx);
  if (!obj) return { value: null, errors: ctx.errors };

  const slug = reqStr(ctx, obj, 'slug');
  const branch: BranchDef = {
    key: branchKey(area, slug),
    area,
    slug,
    name: reqStr(ctx, obj, 'name'),
    description: str(ctx, obj, 'description'),
    position: num(ctx, obj, 'position') ?? 0,
  };
  if (obj.position === undefined) fail(ctx, 'position', 'é obrigatório');
  return done(branch, ctx);
}

// ── Nó ────────────────────────────────────────────────────────────────────

function parsePlacement(ctx: Ctx, obj: Obj, branch: string, path: string): PlacementDef {
  return {
    branch,
    role: oneOf(ctx, obj, 'role', PLACEMENT_ROLES, undefined, `${path}.role`),
    x: num(ctx, obj, 'x', `${path}.x`) ?? -1,
    y: num(ctx, obj, 'y', `${path}.y`) ?? -1,
  };
}

export function parseNode(raw: unknown, file: string): Parsed<NodeDef> {
  const ctx: Ctx = { file, errors: [] };
  const obj = root(raw, ctx);
  if (!obj) return { value: null, errors: ctx.errors };

  const home = reqStr(ctx, obj, 'home');

  const placements: PlacementDef[] = [];
  if (isObj(obj.place)) placements.push(parsePlacement(ctx, obj.place, home, 'place'));
  else fail(ctx, 'place', 'é obrigatório: { role, x, y } na branch-casa');
  list(ctx, obj, 'mirrors').forEach((m, i) => {
    placements.push(parsePlacement(ctx, m, reqStr(ctx, m, 'branch', `mirrors[${i}].branch`), `mirrors[${i}]`));
  });

  const requires: RequirementDef[] = list(ctx, obj, 'requires').map((r, i) => {
    const path = `requires[${i}]`;
    const group = num(ctx, r, 'group', `${path}.group`);
    return {
      node: str(ctx, r, 'node', `${path}.node`),
      branch: str(ctx, r, 'branch', `${path}.branch`),
      minLevel: num(ctx, r, 'min_level', `${path}.min_level`) ?? 1,
      strength: oneOf(ctx, r, 'strength', REQUIREMENT_STRENGTHS, 'obrigatorio', `${path}.strength`),
      ...(group !== undefined ? { group } : {}),
    };
  });

  const related: RelationDef[] = list(ctx, obj, 'related').map((r, i) => ({
    node: reqStr(ctx, r, 'node', `related[${i}].node`),
    type: oneOf(ctx, r, 'type', RELATION_TYPES, undefined, `related[${i}].type`),
  }));

  const criteria: CriterionDef[] = list(ctx, obj, 'levels').flatMap((lvl, i) => {
    const level = num(ctx, lvl, 'level', `levels[${i}].level`) ?? 0;
    return list(ctx, lvl, 'criteria').map((c, j) => {
      const path = `levels[${i}].criteria[${j}]`;
      return {
        id: reqStr(ctx, c, 'id', `${path}.id`),
        level,
        label: reqStr(ctx, c, 'label', `${path}.label`),
        text: reqStr(ctx, c, 'text', `${path}.text`),
      };
    });
  });

  const exercises: ExerciseDef[] = list(ctx, obj, 'exercises').map((e, i) => {
    const path = `exercises[${i}]`;
    const exercise: ExerciseDef = { id: reqStr(ctx, e, 'id', `${path}.id`), title: reqStr(ctx, e, 'title', `${path}.title`) };
    const url = str(ctx, e, 'url', `${path}.url`);
    if (url) exercise.url = url;
    if (e.difficulty !== undefined) exercise.difficulty = oneOf(ctx, e, 'difficulty', DIFFICULTIES, undefined, `${path}.difficulty`);
    return exercise;
  });

  const node: NodeDef = {
    slug: reqStr(ctx, obj, 'slug'),
    title: reqStr(ctx, obj, 'title'),
    home,
    kind: oneOf(ctx, obj, 'kind', NODE_KINDS),
    content: oneOf(ctx, obj, 'content', CONTENT_STATUSES, 'planejado'),
    maxLevel: num(ctx, obj, 'max_level') ?? 3,
    placements,
    requires,
    related,
    criteria,
    exercises,
  };
  const estMinutes = num(ctx, obj, 'est_minutes');
  if (estMinutes !== undefined) node.estMinutes = estMinutes;
  const summary = str(ctx, obj, 'summary');
  if (summary) node.summary = summary;
  const visualizer = str(ctx, obj, 'visualizer');
  if (visualizer) node.visualizer = visualizer;

  return done(node, ctx);
}
