import type { MasteryDimension } from '../mastery';

/**
 * O molde de um tópico. Two Pointers é a primeira implementação completa;
 * todo tópico futuro preenche esta mesma estrutura, então a página de tópico
 * nunca precisa ser reescrita.
 */
export interface TopicSectionDef {
  key: string;
  label: string;
}

export interface TopicContent {
  id: string;
  name: string;
  glyph: string;
  tagline: string;
  badges: string[];

  whatIsIt: string[];
  intuition: string[];
  analogy: { title: string; text: string };

  whenToUse: string[];
  whenNotToUse: string[];

  complexity: { time: string; timeNote: string; space: string; spaceNote: string };

  examples: { title: string; input: string; walkthrough: string[] }[];

  template: { language: string; code: string };

  commonMistakes: string[];
  exercises: { id: string; name: string; difficulty: 'Fácil' | 'Médio' | 'Difícil'; why: string }[];
  summary: string[];

  /** Critério concreto por dimensão (§08). As 8 dimensões são fixas. */
  mastery: Record<MasteryDimension, string>;

  /** Perguntas de revisão ativa. */
  review: { question: string; answer: string }[];

  /** Qual visualizador embutir, se houver. */
  visualizer?: 'two-pointers';
}

/** Seções renderizadas no drawer, na ordem. */
export const TOPIC_SECTIONS: TopicSectionDef[] = [
  { key: 'visao-geral', label: 'Visão geral' },
  { key: 'intuicao', label: 'Intuição' },
  { key: 'analogia', label: 'Analogia' },
  { key: 'visualizacao', label: 'Visualização' },
  { key: 'quando-usar', label: 'Quando usar' },
  { key: 'complexidade', label: 'Complexidade' },
  { key: 'exemplos', label: 'Exemplos' },
  { key: 'codigo', label: 'Código' },
  { key: 'erros-comuns', label: 'Erros comuns' },
  { key: 'exercicios', label: 'Exercícios' },
  { key: 'resumo', label: 'Resumo' },
  { key: 'revisao', label: 'Revisão' },
];
