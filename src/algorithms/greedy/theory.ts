import type { AlgorithmTheory } from '../../simulation/types';

export const theory: AlgorithmTheory = {
  idea: 'Expande sempre o nó que *parece* mais próximo do objetivo, usando apenas a estimativa heurística h(n) — ignora completamente quanto já foi gasto para chegar até ali.',
  decisionRule: 'Escolhe o nó da fronteira com menor h(n), a estimativa de distância restante até o objetivo.',
  dataStructure: 'Fila de prioridade ordenada por h(n).',
  complete: 'Não, em geral — pode entrar em ciclos ou ramos longos se a heurística for enganosa, embora em grafos finitos sem repetição costume terminar.',
  optimal: 'Não. Uma heurística otimista sobre um ramo caro pode levar a Gulosa a se comprometer com um caminho ruim.',
  timeComplexity: 'O(b^m) no pior caso, mas na prática costuma ser muito mais rápida que buscas não-informadas quando a heurística é boa.',
  spaceComplexity: 'O(b^m) no pior caso — mantém toda a fronteira.',
  advantages: [
    'Pode ser muito rápida quando a heurística é precisa.',
    'Usa informação do domínio do problema para guiar a busca, em vez de explorar às cegas.',
  ],
  disadvantages: [
    'Sensível a heurísticas ruins: pode ser enganada e seguir um caminho caro que "parecia" promissor.',
    'Não garante otimalidade nem sempre garante completude.',
  ],
  whenToUse: 'Quando uma heurística razoavelmente confiável está disponível e velocidade importa mais que garantir o caminho ótimo.',
  commonMistakes: [
    'Achar que "gulosa" significa "sempre erra" — quando a heurística é boa, pode até acertar o caminho ótimo, só não garante isso.',
    'Confundir h(n) (estimativa até o objetivo) com g(n) (custo já gasto) — a Gulosa ignora g(n) por completo, o que é exatamente sua fraqueza.',
  ],
};
