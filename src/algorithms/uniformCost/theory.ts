import type { AlgorithmTheory } from '../../simulation/types';

export const theory: AlgorithmTheory = {
  idea: 'Expande sempre o nó da fronteira com menor custo acumulado desde o início — não importa a profundidade, apenas quanto já foi "gasto" para chegar até ali.',
  decisionRule: 'Escolhe o nó com menor g(n), o custo acumulado desde o estado inicial. Ao encontrar um caminho mais barato para um nó já na fronteira, atualiza sua prioridade.',
  dataStructure: 'Fila de prioridade ordenada por g(n).',
  complete: 'Sim, desde que todos os custos de aresta sejam positivos.',
  optimal: 'Sim — garante o caminho de menor custo total, mesmo que ele tenha mais passos que outras alternativas.',
  timeComplexity: 'O(b^(1+⌊C*/ε⌋)), onde C* é o custo da solução ótima e ε o menor custo de aresta.',
  spaceComplexity: 'Mesma ordem do tempo — precisa manter toda a fronteira ordenada por custo.',
  advantages: [
    'Garante a solução mais barata, ao contrário de BFS.',
    'Funciona mesmo quando os custos de aresta variam muito entre si.',
  ],
  disadvantages: [
    'Pode explorar muitos nós irrelevantes por não ter nenhuma noção de "direção" até o objetivo.',
    'Consumo de memória alto, como BFS.',
  ],
  whenToUse: 'Quando os custos de aresta não são uniformes e a solução mais barata importa mais que a mais rasa — e não há heurística disponível para guiar a busca.',
  commonMistakes: [
    'Confundir g(n) com profundidade: g(n) é custo acumulado, profundidade é número de arestas — só coincidem quando todo custo de aresta é 1.',
    'Testar o objetivo assim que ele é gerado em vez de quando é retirado da fronteira, o que pode devolver uma solução não-ótima se houver caminhos mais baratos ainda não avaliados.',
  ],
};
