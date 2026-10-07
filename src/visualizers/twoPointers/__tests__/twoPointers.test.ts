import { describe, expect, it } from 'vitest';
import { buildTwoPointersTrace } from '../run';

describe('Two Pointers — Two Sum II', () => {
  const nums = [1, 2, 3, 4, 6, 8, 9, 11];
  const trace = buildTwoPointersTrace(nums, 9);
  const final = trace.steps[trace.steps.length - 1].state;

  it('encontra o par (0, 5) — 1 + 8 = 9', () => {
    expect(final.status).toBe('found');
    expect(final.found).toEqual([0, 5]);
    expect(nums[0] + nums[5]).toBe(9);
  });

  it('leva 7 passos atômicos: init + (comparar, mover) x2 + comparar + encontrado', () => {
    expect(trace.steps).toHaveLength(7);
  });

  it('só move right, porque toda soma testada foi maior que o alvo', () => {
    const rights = trace.steps.map((s) => s.state.right);
    expect(rights).toEqual([7, 7, 6, 6, 5, 5, 5]);
    expect(new Set(trace.steps.map((s) => s.state.left))).toEqual(new Set([0]));
  });

  it('nunca deixa os ponteiros se cruzarem', () => {
    for (const step of trace.steps) {
      expect(step.state.left).toBeLessThanOrEqual(step.state.right);
    }
  });

  it('reporta ausência de solução quando os ponteiros se encontram', () => {
    const t = buildTwoPointersTrace([1, 2, 3], 100);
    const last = t.steps[t.steps.length - 1].state;
    expect(last.status).toBe('exhausted');
    expect(last.found).toBeUndefined();
  });

  it('cada passo carrega narração com título e texto', () => {
    for (const step of trace.steps) {
      expect(step.narration.title.length).toBeGreaterThan(0);
      expect(step.narration.text.length).toBeGreaterThan(0);
    }
  });
});
