import type { Narration } from '../../simulation/types';

/**
 * Decomposição de um problema, passo a passo: primeiro a árvore de
 * entrada → processamento → saída vai sendo montada, depois o algoritmo
 * montado é executado sobre uma entrada de verdade.
 *
 * Mesma disciplina do Two Pointers: cada passo é uma decisão só.
 */

export interface DecompNode {
  id: string;
  label: string;
  /** Pergunta que a etapa responde ou o que ela contém. */
  detail?: string;
  children?: DecompNode[];
}

/** O problema de exemplo: média da turma e situação (aprovada se média ≥ corte). */
export function mediaTree(cut: number): DecompNode {
  return {
    id: 'problema',
    label: 'Média da turma',
    detail: `Calcular a média das notas e dizer se a turma foi aprovada (média ≥ ${cut}).`,
    children: [
      { id: 'entrada', label: 'Entrada', detail: 'O que eu recebo? A lista de notas.' },
      {
        id: 'processamento',
        label: 'Processamento',
        detail: 'Como chego da entrada à saída?',
        children: [
          {
            id: 'somar',
            label: 'Somar todas as notas',
            children: [
              { id: 'zerar', label: 'Começar a soma em 0' },
              { id: 'acumular', label: 'Para cada nota, somar à soma' },
            ],
          },
          { id: 'dividir', label: 'Dividir a soma pela quantidade de notas' },
          { id: 'comparar', label: `Comparar a média com ${cut}` },
        ],
      },
      { id: 'saida', label: 'Saída', detail: 'O que eu devolvo? A média e "Aprovada" ou "Reprovada".' },
    ],
  };
}

export interface DecompState {
  phase: 'decompor' | 'executar';
  /** Etapas da árvore já descobertas. */
  revealed: string[];
  /** Etapa em foco neste passo. */
  current: string;
  /** Memória durante a execução. */
  vars: { soma?: number; nota?: number; indice?: number; media?: number; resultado?: string };
}

export interface DecompStep {
  state: DecompState;
  narration: Narration;
}

export interface DecompTrace {
  tree: DecompNode;
  notas: number[];
  cut: number;
  steps: DecompStep[];
}

const fmt = (n: number) => (Number.isInteger(n) ? String(n) : n.toFixed(2).replace(/0$/, '').replace('.', ','));

export function buildDecompositionTrace(notas: number[], cut = 7): DecompTrace {
  const tree = mediaTree(cut);
  const steps: DecompStep[] = [];
  const revealed: string[] = [];

  const reveal = (id: string, title: string, text: string) => {
    revealed.push(id);
    steps.push({ state: { phase: 'decompor', revealed: [...revealed], current: id, vars: {} }, narration: { title, text } });
  };

  // ── 1. Decompor ──────────────────────────────────────────────────────────
  reveal('problema', 'O problema', 'Antes de qualquer código: o que exatamente é pedido? Aqui, a média das notas e a situação da turma.');
  reveal('entrada', 'Entrada: o que eu recebo?', 'Uma lista de notas. Pode ter qualquer tamanho, e isso precisa ser levado em conta nos passos.');
  reveal('saida', 'Saída: o que eu devolvo?', 'Dois resultados: a média e a palavra "Aprovada" ou "Reprovada". Definir a saída cedo evita resolver o problema errado.');
  reveal('processamento', 'Processamento: como chego lá?', 'O caminho da entrada até a saída. Ainda é grande demais para virar código direto, então ele também é decomposto.');
  reveal('somar', 'Primeiro subproblema: somar', 'A média precisa da soma. "Somar todas as notas" ainda esconde uma repetição, então vale quebrar de novo.');
  reveal('dividir', 'Segundo: dividir', 'Com a soma pronta, dividir pela quantidade de notas. É um passo só: não precisa ser quebrado.');
  reveal('comparar', 'Terceiro: comparar', `Com a média pronta, comparar com ${cut} decide a situação. Também é um passo só.`);
  reveal('zerar', 'Somar, parte 1: começar em 0', 'Toda soma acumulada começa em zero. Esquecer este passo é um dos erros mais comuns.');
  reveal('acumular', 'Somar, parte 2: acumular', 'Para cada nota, somar à soma. Agora todo passo é pequeno o bastante para virar uma linha de código.');

  // ── 2. Executar ──────────────────────────────────────────────────────────
  const run = (current: string, vars: DecompState['vars'], title: string, text: string) =>
    steps.push({ state: { phase: 'executar', revealed: [...revealed], current, vars }, narration: { title, text } });

  let soma = 0;
  run('zerar', { soma }, 'Executando: soma = 0', `Entrada: [${notas.join(', ')}]. A decomposição está pronta; agora cada passo é seguido à risca.`);
  notas.forEach((nota, indice) => {
    soma += nota;
    run('acumular', { soma, nota, indice }, `soma = ${soma - nota} + ${nota} = ${soma}`, `Nota ${indice + 1} de ${notas.length}. O mesmo passo se repete para cada nota da entrada.`);
  });
  const media = notas.length > 0 ? soma / notas.length : 0;
  run('dividir', { soma, media }, `média = ${soma} ÷ ${notas.length} = ${fmt(media)}`, 'Dividir pela quantidade de notas, não por um número fixo: o algoritmo funciona para qualquer turma.');
  const resultado = media >= cut ? 'Aprovada' : 'Reprovada';
  run('comparar', { soma, media, resultado }, `${fmt(media)} ${media >= cut ? '≥' : '<'} ${cut} → ${resultado}`, 'Um passo de decisão com uma pergunta de sim ou não.');
  run('saida', { soma, media, resultado }, `Saída: ${fmt(media)} · ${resultado}`, 'A saída é exatamente o que foi definido no começo. Se não fosse, o problema estaria resolvido pela metade.');

  return { tree, notas, cut, steps };
}
