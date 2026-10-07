import type { AlgorithmTheory } from '../../simulation/types';

export const theory: AlgorithmTheory = {
  idea: 'Constrói uma solução incrementalmente, tentando uma escolha por vez; quando uma escolha se mostra inviável, desfaz explicitamente essa decisão (backtrack) e tenta a próxima alternativa.',
  decisionRule: 'Segue o primeiro sucessor disponível; ao encontrar um beco sem saída ou uma restrição violada, desfaz a última decisão e tenta a alternativa seguinte.',
  dataStructure: 'Pilha implícita (via recursão) representando o caminho de decisões atual.',
  complete: 'Sim, em espaços de busca finitos — eventualmente experimenta todas as combinações possíveis.',
  optimal: 'Não por padrão; encontra a primeira solução válida, não necessariamente a melhor. Pode ser adaptado para continuar buscando e guardar a melhor.',
  timeComplexity: 'O(b^m) no pior caso, como DFS — mas podas (restrições verificadas cedo) costumam reduzir drasticamente o espaço explorado na prática.',
  spaceComplexity: 'O(m) — apenas o caminho de decisões atual.',
  advantages: [
    'Encontra soluções em espaços de decisão complexos (não apenas grafos) como combinações, permutações e N-rainhas.',
    'Podas (restrições verificadas durante a construção) evitam explorar ramos claramente inválidos.',
  ],
  disadvantages: [
    'Pode ser lento se as restrições só forem detectadas tarde demais na construção da solução.',
    'Sem otimização adicional, não garante a melhor solução, apenas alguma solução válida.',
  ],
  whenToUse: 'Problemas de satisfação de restrições e construção de soluções passo a passo: combinações, quebra-cabeças, coloração de grafos, N-rainhas — não apenas caminhos em grafos.',
  commonMistakes: [
    'Achar que Backtracking é só "outro nome para DFS": DFS percorre um grafo já existente, enquanto Backtracking constrói e desfaz decisões, podendo ser aplicado a problemas sem um grafo explícito.',
    'Esquecer de desfazer (undo) o efeito de uma decisão ao retroceder, causando estado inconsistente.',
  ],
};
