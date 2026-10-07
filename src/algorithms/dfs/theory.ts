import type { AlgorithmTheory } from '../../simulation/types';

export const theory: AlgorithmTheory = {
  idea: 'Mergulha o mais fundo possível em um ramo antes de considerar outro. Só volta (backtracking) quando um ramo se esgota sem encontrar o objetivo.',
  decisionRule: 'Sempre expande o nó descoberto mais recentemente — o topo da pilha.',
  dataStructure: 'Pilha LIFO (Last In, First Out), ou recursão (que usa a pilha de chamadas do programa implicitamente).',
  complete: 'Apenas em grafos finitos e sem ciclos não controlados. Em grafos infinitos ou com ciclos, pode entrar em um ramo sem fim e nunca terminar.',
  optimal: 'Não. DFS aceita a primeira solução que encontra, mesmo que exista outra mais barata em um ramo ainda não visitado.',
  timeComplexity: 'O(b^m), onde b é o fator de ramificação e m é a profundidade máxima do espaço de busca.',
  spaceComplexity: 'O(b·m) — só precisa manter o caminho atual e os irmãos não explorados, muito mais leve que BFS.',
  advantages: [
    'Consumo de memória baixo comparado à Busca em Largura.',
    'Pode encontrar uma solução rapidamente se ela estiver em um ramo explorado cedo.',
    'Natural para problemas que já são descritos como uma árvore de decisões.',
  ],
  disadvantages: [
    'Não garante o caminho mais curto nem o mais barato.',
    'Pode gastar muito tempo explorando um ramo profundo e irrelevante antes de tentar um ramo mais promissor.',
    'Sem controle de profundidade, pode nunca terminar em grafos infinitos.',
  ],
  whenToUse: 'Quando memória é escassa, quando qualquer solução serve (não precisa ser a melhor), ou quando se sabe que soluções tendem a estar profundas na árvore.',
  commonMistakes: [
    'Achar que DFS é "BFS ao contrário" — a diferença de estrutura (pilha vs. fila) muda completamente quais nós são visitados e em que ordem.',
    'Confundir DFS genérico com Backtracking: todo Backtracking usa uma estratégia parecida com DFS, mas nem todo DFS desfaz e registra decisões da forma explícita que o Backtracking faz.',
    'Esperar que a primeira solução encontrada seja a melhor.',
  ],
};
