import type {
  AreaDef,
  AreaIcon,
  BranchDef,
  Catalog,
  ContentStatus,
  CriterionDef,
  Difficulty,
  ExerciseDef,
  NodeDef,
  NodeKind,
  PlacementDef,
  PlacementRole,
  RelationDef,
  RelationType,
  RequirementDef,
  RequirementStrength,
} from '../../src/domain/tree/types.ts';
import type { Db } from '../db.ts';

/** `null` do banco vira campo ausente, como no catalog.json. */
function opt<T>(value: T | null): T | undefined {
  return value === null ? undefined : value;
}

/** Lê o catálogo do banco no mesmo formato de src/generated/catalog.json. */
export function readCatalog(db: Db): Catalog {
  const areas: AreaDef[] = (
    db.prepare('SELECT slug, name, sub, description, color, icon, position FROM area ORDER BY position, slug').all() as {
      slug: string;
      name: string;
      sub: string | null;
      description: string | null;
      color: string;
      icon: string;
      position: number;
    }[]
  ).map((a) => ({
    slug: a.slug,
    name: a.name,
    sub: opt(a.sub),
    description: opt(a.description),
    color: a.color,
    icon: a.icon as AreaIcon,
    position: a.position,
  }));

  const branches: BranchDef[] = (
    db
      .prepare(
        `SELECT a.slug AS area, b.slug, b.name, b.description, b.position
         FROM branch b JOIN area a ON a.id = b.area_id ORDER BY a.slug, b.slug`,
      )
      .all() as { area: string; slug: string; name: string; description: string | null; position: number }[]
  ).map((b) => ({
    key: `${b.area}/${b.slug}`,
    area: b.area,
    slug: b.slug,
    name: b.name,
    description: opt(b.description),
    position: b.position,
  }));

  const rows = db
    .prepare(
      `SELECT n.id, n.slug, n.title, n.summary, n.kind, n.content_status, n.content_path, n.max_level,
              n.est_minutes, n.visualizer, a.slug || '/' || b.slug AS home
       FROM node n JOIN branch b ON b.id = n.home_branch_id JOIN area a ON a.id = b.area_id
       ORDER BY n.slug`,
    )
    .all() as {
    id: number;
    slug: string;
    title: string;
    summary: string | null;
    kind: NodeKind;
    content_status: ContentStatus;
    content_path: string | null;
    max_level: number;
    est_minutes: number | null;
    visualizer: string | null;
    home: string;
  }[];

  const placementsOf = db.prepare(
    `SELECT a.slug || '/' || b.slug AS branch, p.role, p.x, p.y
     FROM node_placement p JOIN branch b ON b.id = p.branch_id JOIN area a ON a.id = b.area_id
     WHERE p.node_id = ? ORDER BY (p.branch_id <> ?), branch`,
  );
  const requirementsOf = db.prepare(
    `SELECT t.slug AS node, ta.slug || '/' || tb.slug AS branch, r.min_level, r.strength, r.alt_group
     FROM requirement r
     LEFT JOIN node t ON t.id = r.req_node_id
     LEFT JOIN branch tb ON tb.id = r.req_branch_id
     LEFT JOIN area ta ON ta.id = tb.area_id
     WHERE r.node_id = ? ORDER BY r.id`,
  );
  const relationsOf = db.prepare(
    'SELECT b.slug AS node, r.type FROM node_relation r JOIN node b ON b.id = r.b_id WHERE r.a_id = ? ORDER BY r.rowid',
  );
  const criteriaOf = db.prepare(
    'SELECT slug, level, label, description FROM node_criterion WHERE node_id = ? ORDER BY level, position',
  );
  const exercisesOf = db.prepare('SELECT slug, title, url, difficulty FROM exercise WHERE node_id = ? ORDER BY position');
  const homeIdOf = db.prepare('SELECT home_branch_id AS id FROM node WHERE id = ?');

  const nodes: NodeDef[] = rows.map((n) => {
    const homeId = (homeIdOf.get(n.id) as { id: number }).id;
    return {
      slug: n.slug,
      title: n.title,
      home: n.home,
      kind: n.kind,
      content: n.content_status,
      maxLevel: n.max_level,
      estMinutes: opt(n.est_minutes),
      summary: opt(n.summary),
      placements: (placementsOf.all(n.id, homeId) as { branch: string; role: PlacementRole; x: number; y: number }[]).map(
        (p): PlacementDef => ({ branch: p.branch, role: p.role, x: p.x, y: p.y }),
      ),
      requires: (
        requirementsOf.all(n.id) as {
          node: string | null;
          branch: string | null;
          min_level: number;
          strength: RequirementStrength;
          alt_group: number | null;
        }[]
      ).map(
        (r): RequirementDef => ({
          node: opt(r.node),
          branch: opt(r.branch),
          minLevel: r.min_level,
          strength: r.strength,
          group: opt(r.alt_group),
        }),
      ),
      related: (relationsOf.all(n.id) as { node: string; type: RelationType }[]).map(
        (r): RelationDef => ({ node: r.node, type: r.type }),
      ),
      criteria: (criteriaOf.all(n.id) as { slug: string; level: number; label: string; description: string }[]).map(
        (c): CriterionDef => ({ id: c.slug, level: c.level, label: c.label, text: c.description }),
      ),
      exercises: (
        exercisesOf.all(n.id) as { slug: string; title: string; url: string | null; difficulty: Difficulty | null }[]
      ).map((e): ExerciseDef => ({ id: e.slug, title: e.title, url: opt(e.url), difficulty: opt(e.difficulty) })),
      visualizer: opt(n.visualizer),
      contentPath: opt(n.content_path),
    };
  });

  return { areas, branches, nodes };
}
