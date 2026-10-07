import type { AlgorithmTheory } from '../../simulation/types';

export const theory: AlgorithmTheory = {
  idea: 'A cada passo, compromete-se com o sucessor de menor custo de aresta imediato e nunca reconsidera essa escolha — não existe backtracking.',
  decisionRule: 'Escolhe sempre o sucessor com menor custo de aresta a partir do nó atual, de forma míope (olhando só um passo à frente).',
  dataStructure: 'Nenhuma fronteira: apenas o nó atual e o caminho já percorrido.',
  complete: 'Não. Se a primeira escolha levar a um beco sem saída, a busca falha — mesmo que exista solução por outro caminho.',
  optimal: 'Não é sequer garantido encontrar uma solução, então a pergunta de otimalidade nem se aplica na maioria dos casos.',
  timeComplexity: 'O(m), onde m é a profundidade máxima antes de travar — muito rápida quando funciona.',
  spaceComplexity: 'O(m) — só guarda o caminho atual.',
  advantages: ['Extremamente simples e barata em memória.', 'Rápida quando o problema não exige reconsiderar decisões.'],
  disadvantages: [
    'Pode falhar mesmo quando existe solução, apenas por escolher mal no início.',
    'Não garante nada sobre completude ou otimalidade.',
  ],
  whenToUse: 'Raramente indicada sozinha; serve principalmente como contraste didático para mostrar por que backtracking ou reconsideração são necessários.',
  commonMistakes: [
    'Achar que "escolher o menor custo imediato" é o mesmo que Busca de Custo Uniforme — a diferença é que a Busca de Custo Uniforme reconsidera e compara o custo acumulado global, não apenas o próximo passo.',
  ],
};
