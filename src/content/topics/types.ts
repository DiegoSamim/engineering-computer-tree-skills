/**
 * O corpo das 12 guias de um nó do arquétipo `padrao`, em TypeScript
 * (decisão: sem MDX por enquanto). Os metadados do nó (requisitos,
 * critérios, exercícios com título, url e dificuldade) ficam no YAML em
 * content/; aqui fica só o texto. O arquivo se chama <slug>.ts e é
 * registrado em ./registry.ts.
 */
export interface TopicContent {
  whatIsIt: string[];
  intuition: string[];
  analogy: { title: string; text: string };

  whenToUse: string[];
  whenNotToUse: string[];

  complexity: { time: string; timeNote: string; space: string; spaceNote: string };

  examples: { title: string; input: string; walkthrough: string[] }[];

  template: { language: string; code: string };

  commonMistakes: string[];
  /** Por que fazer cada exercício, pelo id do exercício no YAML do nó. */
  exerciseWhy: Record<string, string>;
  summary: string[];

  /** Perguntas de revisão ativa. */
  review: { question: string; answer: string }[];
}
