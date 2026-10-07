import { MASTERY_DIMENSIONS, type MasteryDimension } from '../data/types';

export { MASTERY_DIMENSIONS };
export type { MasteryDimension };

/**
 * The 8 observable mastery dimensions from §08 of the roadmap. They are the
 * same for every topic — only the concrete criterion text changes — which is
 * what makes the checklist cheap to replicate across topics instead of
 * inventing an ad-hoc list per subject.
 */
export const MASTERY_LABELS: Record<MasteryDimension, { label: string; generic: string }> = {
  reconhecimento: {
    label: 'Reconhecimento',
    generic: 'Em um problema novo, levantar 1–3 padrões plausíveis sem receber o nome do tópico.',
  },
  modelagem: {
    label: 'Modelagem',
    generic: 'Definir estado, invariantes, estruturas e limites antes do código.',
  },
  implementacao: {
    label: 'Implementação',
    generic: 'Escrever a solução comum sem depender de copiar template.',
  },
  correcao: {
    label: 'Correção',
    generic: 'Explicar por que o algoritmo funciona, ainda que informalmente.',
  },
  complexidade: {
    label: 'Complexidade',
    generic: 'Derivar Big-O de tempo e espaço corretamente.',
  },
  validacao: {
    label: 'Validação',
    generic: 'Criar casos normais e de borda e executar dry run.',
  },
  retencao: {
    label: 'Retenção',
    generic: 'Refazer uma questão semelhante dias depois sem consultar a solução.',
  },
  performance: {
    label: 'Performance',
    generic: 'Conseguir fazer tudo isso verbalizando sob limite de tempo.',
  },
};
