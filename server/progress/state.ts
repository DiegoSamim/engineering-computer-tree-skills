import type { NodeStateView, TreeState } from '../../src/domain/tree/api.ts';
import type { CatalogIndex } from '../../src/domain/tree/catalogIndex.ts';
import { areaProgress, totalProgress, type BranchProgress } from '../../src/domain/tree/counters.ts';
import type { NodeState, ProgressMap } from '../../src/domain/tree/types.ts';
import type { Db } from '../db.ts';

const USER = 1;

/**
 * Monta o estado que a tela pinta. Estado do nó, contadores de branch e XP
 * vêm das views SQL; contadores de área (só nós da casa) vêm do domínio.
 */
export function readState(db: Db, index: CatalogIndex): TreeState {
  const user = db.prepare('SELECT display_name FROM app_user WHERE id = ?').get(USER) as { display_name: string | null };

  const rows = db
    .prepare(
      `SELECT s.slug, s.level, s.state, un.started_at, un.completed_at, COALESCE(un.seconds_studied, 0) AS seconds
       FROM v_node_state s LEFT JOIN user_node un ON un.node_id = s.node_id AND un.user_id = s.user_id
       WHERE s.user_id = ?`,
    )
    .all(USER) as {
    slug: string;
    level: number;
    state: NodeState;
    started_at: string | null;
    completed_at: string | null;
    seconds: number;
  }[];

  const nodes: Record<string, NodeStateView> = {};
  const progress: ProgressMap = {};
  for (const r of rows) {
    nodes[r.slug] = {
      level: r.level,
      state: r.state,
      startedAt: r.started_at,
      completedAt: r.completed_at,
      secondsStudied: r.seconds,
      criteria: [],
      guides: [],
      exercises: {},
    };
    progress[r.slug] = { level: r.level, started: r.started_at !== null };
  }

  for (const r of db
    .prepare(
      `SELECT n.slug, c.slug AS criterion FROM user_criterion uc
       JOIN node_criterion c ON c.id = uc.criterion_id JOIN node n ON n.id = c.node_id
       WHERE uc.user_id = ? ORDER BY c.level, c.position`,
    )
    .all(USER) as { slug: string; criterion: string }[]) {
    nodes[r.slug]?.criteria.push(r.criterion);
  }

  for (const r of db
    .prepare('SELECT n.slug, g.guide_id FROM user_guide g JOIN node n ON n.id = g.node_id WHERE g.user_id = ? ORDER BY g.read_at')
    .all(USER) as { slug: string; guide_id: string }[]) {
    nodes[r.slug]?.guides.push(r.guide_id);
  }

  for (const r of db
    .prepare(
      `SELECT n.slug, e.slug AS exercise, ue.attempts, ue.solved_at FROM user_exercise ue
       JOIN exercise e ON e.id = ue.exercise_id JOIN node n ON n.id = e.node_id WHERE ue.user_id = ?`,
    )
    .all(USER) as { slug: string; exercise: string; attempts: number; solved_at: string | null }[]) {
    const node = nodes[r.slug];
    if (node) node.exercises[r.exercise] = { attempts: r.attempts, solvedAt: r.solved_at };
  }

  const branches: Record<string, BranchProgress> = {};
  for (const key of index.branches.keys()) {
    branches[key] = { total: 0, withContent: 0, done: 0, mastered: 0, trunkTotal: 0, trunkDone: 0 };
  }
  for (const r of db
    .prepare(
      `SELECT branch_key, nodes_total, nodes_with_content, nodes_done, nodes_mastered, trunk_total, trunk_done
       FROM v_branch_progress WHERE user_id = ?`,
    )
    .all(USER) as Record<string, number | string>[]) {
    branches[r.branch_key as string] = {
      total: Number(r.nodes_total),
      withContent: Number(r.nodes_with_content),
      done: Number(r.nodes_done),
      mastered: Number(r.nodes_mastered),
      trunkTotal: Number(r.trunk_total),
      trunkDone: Number(r.trunk_done),
    };
  }

  const xp = new Map(
    (db.prepare('SELECT slug, xp FROM v_area_xp WHERE user_id = ?').all(USER) as { slug: string; xp: number }[]).map((r) => [
      r.slug,
      r.xp,
    ]),
  );
  const areas: TreeState['areas'] = {};
  for (const [slug, count] of Object.entries(areaProgress(index, progress))) {
    areas[slug] = { ...count, xp: xp.get(slug) ?? 0 };
  }

  return {
    user: { displayName: user.display_name },
    totals: totalProgress(index, progress),
    areas,
    branches,
    nodes,
  };
}
