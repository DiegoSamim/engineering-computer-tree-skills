/** As 12 guias do arquétipo `padrao`, nesta ordem. Os ids são permanentes. */
export const GUIDES = [
  { id: 'visao-geral', label: 'Visão geral' },
  { id: 'intuicao', label: 'Intuição' },
  { id: 'analogia', label: 'Analogia' },
  { id: 'visualizacao', label: 'Visualização' },
  { id: 'quando-usar', label: 'Quando usar' },
  { id: 'complexidade', label: 'Complexidade' },
  { id: 'exemplos', label: 'Exemplos' },
  { id: 'codigo', label: 'Código' },
  { id: 'erros-comuns', label: 'Erros comuns' },
  { id: 'exercicios', label: 'Exercícios' },
  { id: 'resumo', label: 'Resumo' },
  { id: 'revisao', label: 'Revisão' },
] as const;

export type GuideId = (typeof GUIDES)[number]['id'];

export const GUIDE_IDS: readonly string[] = GUIDES.map((g) => g.id);

export function isGuideId(id: string): id is GuideId {
  return GUIDE_IDS.includes(id);
}
