import { describe, expect, it } from 'vitest';
import { indexCatalog } from '../catalogIndex.ts';
import { areaXp, branchProgress } from '../counters.ts';
import { deriveStates } from '../state.ts';
import type { ProgressMap, XpEvent } from '../types.ts';
import { SCENARIOS, SET_LEVEL_XP } from '../__fixtures__/cenarios.ts';

// Porte de docs/db/test_schema.py para a derivação em TypeScript. O mesmo
// roteiro roda contra as views SQL em server/__tests__/schema.test.ts.
describe.each(SCENARIOS)('cenário: $name', ({ catalog, steps }) => {
  it('produz os estados esperados a cada passo', () => {
    const index = indexCatalog(catalog());
    const progress: ProgressMap = {};
    const events: XpEvent[] = [];

    for (const step of steps) {
      switch (step.kind) {
        case 'set':
          progress[step.node] = { level: step.level, started: true };
          events.push({ node: step.node, xp: SET_LEVEL_XP });
          break;
        case 'expect': {
          const states = deriveStates(index, progress);
          for (const [slug, expected] of Object.entries(step.states)) {
            expect({ slug, state: states[slug] }).toEqual({ slug, state: expected });
          }
          break;
        }
        case 'expectBranch': {
          const row = branchProgress(index, progress, deriveStates(index, progress))[step.branch];
          expect({ done: row.done, total: row.total }).toEqual({ done: step.done, total: step.total });
          break;
        }
        case 'expectXp':
          expect(areaXp(index, events)).toEqual(step.xp);
          break;
      }
    }
  });
});
