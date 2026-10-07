import type { AlgorithmTheory } from '../../simulation/types';

export const theory: AlgorithmTheory = {
  idea: 'Faz o que o A* faz, mas troca a fronteira em memória por sucessivas buscas em profundidade limitadas por um teto de f(n) — o "limite" — que cresce a cada rodada até a solução ser encontrada.',
  decisionRule: 'Em cada iteração, explora em profundidade, mas poda (interrompe) qualquer ramo cujo f(n) ultrapasse o limite atual. O próximo limite é o menor f(n) que ultrapassou o limite desta rodada.',
  dataStructure: 'Pilha implícita (DFS), sem fronteira em memória — apenas o caminho atual e o limite de f(n) da iteração.',
  complete: 'Sim, em espaços de busca finitos com custos positivos.',
  optimal: 'Sim, com as mesmas condições de admissibilidade de h(n) exigidas pelo A*.',
  timeComplexity: 'Pode reexplorar os mesmos nós em múltiplas iterações, mas o custo extra costuma ser pequeno comparado à economia de memória.',
  spaceComplexity: 'O(m) — apenas o caminho atual, muito menor que o A* tradicional.',
  advantages: [
    'Mesma garantia de otimalidade do A*, com uso de memória equivalente ao DFS.',
    'Ideal quando o espaço de busca é grande demais para caber a fronteira do A* em memória.',
  ],
  disadvantages: [
    'Reexplora nós entre iterações, o que pode ser custoso se houver muitos nós com f(n) próximos entre si.',
    'Mais complexo de implementar corretamente que A*.',
  ],
  whenToUse: 'Quando A* seria ótimo, mas o espaço de busca é grande demais para manter a fronteira inteira em memória.',
  commonMistakes: [
    'Esquecer de atualizar o limite para o menor f(n) que ultrapassou o limite anterior — usar qualquer outro valor quebra a garantia de otimalidade ou desperdiça iterações.',
    'Achar que cada iteração começa do zero sem aproveitar nada da anterior — na prática, o único reaproveitamento é o novo limite, calculado a partir da rodada anterior.',
  ],
};
