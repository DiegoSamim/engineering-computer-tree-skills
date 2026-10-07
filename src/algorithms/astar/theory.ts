import type { AlgorithmTheory } from '../../simulation/types';

export const theory: AlgorithmTheory = {
  idea: 'Combina o custo já gasto (g) com a estimativa do que falta (h), balanceando "quão longe já cheguei" e "quão perto pareço estar".',
  decisionRule: 'Escolhe o nó da fronteira com menor f(n) = g(n) + h(n).',
  dataStructure: 'Fila de prioridade ordenada por f(n).',
  complete: 'Sim, em espaços de busca finitos com custos positivos.',
  optimal: 'Sim, desde que h(n) seja admissível (nunca superestime o custo real restante) — e, com fronteira em grafo, consistente também.',
  timeComplexity: 'Depende fortemente da qualidade de h(n): quanto mais próxima do custo real, menos nós são explorados. No pior caso, exponencial.',
  spaceComplexity: 'Mesma ordem do tempo — mantém toda a fronteira em memória, seu principal ponto fraco.',
  advantages: [
    'Garante o caminho ótimo, ao contrário da Busca Gulosa.',
    'Geralmente explora muito menos nós que a Busca de Custo Uniforme, graças à heurística.',
  ],
  disadvantages: [
    'Consumo de memória pode ser proibitivo em grafos muito grandes.',
    'Depende de uma heurística admissível — uma heurística mal projetada pode até quebrar a garantia de otimalidade.',
  ],
  whenToUse: 'Quando existe uma heurística admissível disponível e a otimalidade da solução importa — é geralmente a melhor escolha entre as buscas informadas com fronteira em memória.',
  commonMistakes: [
    'Achar que A* é só "Gulosa com mais informação" — a diferença é estrutural: A* nunca ignora g(n), o que é justamente o que garante otimalidade.',
    'Usar uma heurística que superestima o custo restante, quebrando a garantia de encontrar o caminho ótimo.',
  ],
};
