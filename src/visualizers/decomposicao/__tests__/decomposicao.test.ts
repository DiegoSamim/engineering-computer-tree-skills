import { describe, expect, it } from 'vitest';
import { buildDecompositionTrace, type DecompNode } from '../run';

const ids = (node: DecompNode): string[] => [node.id, ...(node.children ?? []).flatMap(ids)];

describe('Decomposição — média da turma', () => {
  const trace = buildDecompositionTrace([7, 9, 6, 8]);
  const last = trace.steps[trace.steps.length - 1].state;

  it('primeiro decompõe, depois executa, sem voltar', () => {
    const phases = trace.steps.map((s) => s.state.phase);
    const firstRun = phases.indexOf('executar');
    expect(phases.slice(0, firstRun).every((p) => p === 'decompor')).toBe(true);
    expect(phases.slice(firstRun).every((p) => p === 'executar')).toBe(true);
  });

  it('descobre cada etapa da árvore uma única vez, uma por passo', () => {
    const decompose = trace.steps.filter((s) => s.state.phase === 'decompor');
    expect(decompose.map((s) => s.state.current).sort()).toEqual(ids(trace.tree).sort());
    expect(decompose.map((s) => s.state.revealed.length)).toEqual(decompose.map((_, i) => i + 1));
  });

  it('define entrada e saída antes do processamento', () => {
    const order = trace.steps.filter((s) => s.state.phase === 'decompor').map((s) => s.state.current);
    expect(order.indexOf('saida')).toBeLessThan(order.indexOf('processamento'));
  });

  it('acumula uma nota por passo e chega na média 7,5 → Aprovada', () => {
    const somas = trace.steps.filter((s) => s.state.phase === 'executar' && s.state.current === 'acumular').map((s) => s.state.vars.soma);
    expect(somas).toEqual([7, 16, 22, 30]);
    expect(last.vars).toMatchObject({ media: 7.5, resultado: 'Aprovada' });
    expect(last.current).toBe('saida');
  });

  it('reprova abaixo do corte e não divide por zero sem notas', () => {
    expect(buildDecompositionTrace([5, 6, 8, 4]).steps.at(-1)!.state.vars).toMatchObject({ media: 5.75, resultado: 'Reprovada' });
    expect(buildDecompositionTrace([]).steps.at(-1)!.state.vars).toMatchObject({ media: 0, resultado: 'Reprovada' });
  });

  it('todo passo tem narração', () => {
    expect(trace.steps.every((s) => s.narration.title && s.narration.text)).toBe(true);
  });
});
