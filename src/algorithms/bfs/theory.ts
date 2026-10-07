import type { AlgorithmTheory } from '../../simulation/types';

export const theory: AlgorithmTheory = {
  idea: 'Explora primeiro todos os nós de menor profundidade antes de avançar para o próximo nível. A busca se espalha em "ondas" concêntricas a partir do estado inicial.',
  decisionRule: 'Sempre expande o nó que está há mais tempo na fronteira — o primeiro que foi descoberto é o primeiro a ser expandido.',
  dataStructure: 'Fila FIFO (First In, First Out).',
  complete: 'Sim, desde que o fator de ramificação seja finito — sempre encontra uma solução se ela existir.',
  optimal: 'Apenas quando todas as arestas têm o mesmo custo. Quando os custos variam, BFS encontra o caminho com menos arestas, não o de menor custo total.',
  timeComplexity: 'O(b^d), onde b é o fator de ramificação e d é a profundidade da solução mais rasa.',
  spaceComplexity: 'O(b^d) — precisa manter toda a fronteira em memória, que cresce exponencialmente com a profundidade.',
  advantages: [
    'Garante encontrar a solução mais próxima em número de passos.',
    'Completa: sempre termina encontrando uma solução, se ela existir.',
    'Simples de implementar e de entender.',
  ],
  disadvantages: [
    'Consumo de memória muito alto em grafos largos ou profundos.',
    'Ignora o custo das arestas — pode devolver um caminho caro só porque tem poucos passos.',
  ],
  whenToUse: 'Quando todos os custos de ação são iguais (ou você só se importa com o número de passos) e o grafo não é grande demais para caber a fronteira inteira em memória.',
  commonMistakes: [
    'Achar que BFS sempre encontra o caminho de menor custo — só é verdade quando os custos são uniformes.',
    'Confundir "menor profundidade" com "menor custo": são a mesma coisa apenas quando cada aresta custa o mesmo.',
    'Esquecer de marcar nós como descobertos ao inseri-los na fila, o que pode causar reprocessamento em grafos com ciclos.',
  ],
};
