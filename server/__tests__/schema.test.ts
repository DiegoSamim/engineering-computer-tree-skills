import { describe, expect, it } from 'vitest';
import { indexCatalog } from '../../src/domain/tree/catalogIndex.ts';
import { areaXp, branchProgress } from '../../src/domain/tree/counters.ts';
import { deriveStates } from '../../src/domain/tree/state.ts';
import type { NodeState, ProgressMap, XpEvent } from '../../src/domain/tree/types.ts';
import { SCENARIOS, SET_LEVEL_XP } from '../../src/domain/tree/__fixtures__/cenarios.ts';
import type { Db } from '../db.ts';
import { freshDb, setLevelDirect } from './helpers.ts';

function sqlStates(db: Db): Record<string, NodeState> {
  const rows = db.prepare('SELECT slug, state FROM v_node_state WHERE user_id = 1').all() as { slug: string; state: NodeState }[];
  return Object.fromEntries(rows.map((r) => [r.slug, r.state]));
}

function sqlProgress(db: Db): ProgressMap {
  const rows = db
    .prepare('SELECT n.slug, un.level, un.started_at FROM user_node un JOIN node n ON n.id = un.node_id WHERE un.user_id = 1')
    .all() as { slug: string; level: number; started_at: string | null }[];
  return Object.fromEntries(rows.map((r) => [r.slug, { level: r.level, started: r.started_at !== null }]));
}

function sqlBranches(db: Db) {
  const rows = db
    .prepare(
      `SELECT branch_key, nodes_total AS total, nodes_with_content AS withContent, nodes_done AS done,
              nodes_mastered AS mastered, trunk_total AS trunkTotal, trunk_done AS trunkDone
       FROM v_branch_progress WHERE user_id = 1`,
    )
    .all() as ({ branch_key: string } & Record<string, number>)[];
  return Object.fromEntries(rows.map(({ branch_key, ...row }) => [branch_key, { ...row }]));
}

function sqlXp(db: Db): Record<string, number> {
  const rows = db.prepare('SELECT slug, xp FROM v_area_xp WHERE user_id = 1').all() as { slug: string; xp: number }[];
  return Object.fromEntries(rows.map((r) => [r.slug, r.xp]));
}

// Porte de docs/db/test_schema.py contra as views SQL, mais a garantia de que
// a derivação em TypeScript (src/domain/tree) dá exatamente o mesmo resultado
// a cada passo: estados de todos os nós, contadores de branch e XP.
describe.each(SCENARIOS)('views SQL × domínio TS: $name', ({ catalog, steps }) => {
  it('batem em cada passo e cumprem as expectativas do cenário', () => {
    const def = catalog();
    const index = indexCatalog(def);
    const db = freshDb(def);
    const events: XpEvent[] = [];

    const assertParity = () => {
      const progress = sqlProgress(db);
      const tsStates = deriveStates(index, progress);
      expect(sqlStates(db)).toEqual(tsStates);

      const tsBranches = branchProgress(index, progress, tsStates);
      for (const [key, row] of Object.entries(sqlBranches(db))) expect({ key, ...row }).toEqual({ key, ...tsBranches[key] });

      expect(sqlXp(db)).toEqual(areaXp(index, events));
    };

    assertParity();
    for (const step of steps) {
      switch (step.kind) {
        case 'set':
          setLevelDirect(db, step.node, step.level, SET_LEVEL_XP);
          events.push({ node: step.node, xp: SET_LEVEL_XP });
          break;
        case 'expect': {
          const states = sqlStates(db);
          for (const [slug, expected] of Object.entries(step.states)) {
            expect({ slug, state: states[slug] }).toEqual({ slug, state: expected });
          }
          break;
        }
        case 'expectBranch': {
          const row = sqlBranches(db)[step.branch];
          expect({ done: row.done, total: row.total }).toEqual({ done: step.done, total: step.total });
          break;
        }
        case 'expectXp':
          expect(sqlXp(db)).toEqual(step.xp);
          break;
      }
      assertParity();
    }
  });
});
