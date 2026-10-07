/**
 * §04 do roadmap — "Reconhecimento de sinais". O objetivo real da prática é
 * reconhecer a estrutura escondida no enunciado, então esta tabela é conteúdo
 * de primeira classe, não um apêndice.
 */
export interface Signal {
  signal: string;
  suspect: string;
  /** Tópico correspondente, quando existe no catálogo. */
  topicId?: string;
}

export const SIGNALS: Signal[] = [
  { signal: 'Frequência, duplicado, "já vi?"', suspect: 'Hash Map / Hash Set', topicId: 'hash-map-set' },
  { signal: 'Par ou tripla em array ordenado', suspect: 'Two Pointers', topicId: 'two-pointers' },
  { signal: 'Substring ou subarray contínuo', suspect: 'Sliding Window / Prefix Sum', topicId: 'sliding-window' },
  { signal: 'Consulta repetida de soma em intervalo', suspect: 'Prefix Sum', topicId: 'prefix-sum' },
  { signal: '"Menor/maior valor que ainda satisfaz…"', suspect: 'Binary Search na resposta', topicId: 'binary-search-resposta' },
  { signal: 'Top K / K-ésimo / próximo item prioritário', suspect: 'Heap', topicId: 'heap' },
  { signal: 'Próximo maior ou menor elemento', suspect: 'Monotonic Stack', topicId: 'monotonic-stack' },
  { signal: 'Intervalos sobrepostos', suspect: 'Sorting + Intervals', topicId: 'intervals' },
  { signal: 'Dependências / pré-requisitos', suspect: 'Topological Sort', topicId: 'cycle-topological' },
  { signal: 'Ilhas / regiões / componentes', suspect: 'DFS / BFS / Union-Find', topicId: 'graphs-bfs-dfs' },
  { signal: 'Menor caminho sem peso', suspect: 'BFS', topicId: 'graphs-bfs-dfs' },
  { signal: 'Menor caminho com peso não-negativo', suspect: 'Dijkstra', topicId: 'dijkstra' },
  { signal: 'Todas as combinações válidas', suspect: 'Backtracking', topicId: 'backtracking' },
  { signal: 'Subproblemas repetidos + escolha ótima', suspect: 'Programação Dinâmica', topicId: 'dp-estado-transicao' },
  { signal: 'Escolha local parece suficiente', suspect: 'Greedy — mas justifique a correção', topicId: 'greedy' },
];

/** O script mental de 7 etapas (§05) — aplicável a qualquer questão. */
export const MENTAL_SCRIPT: { step: string; detail: string }[] = [
  { step: 'Clarificar', detail: '"Posso assumir X? Há duplicados? Qual o tamanho máximo?"' },
  { step: 'Exemplo', detail: 'Criar um caso pequeno e confirmar a interpretação.' },
  { step: 'Brute force', detail: 'Descrever a solução mais simples e seu custo.' },
  { step: 'Gargalo', detail: 'Apontar exatamente o que torna a abordagem lenta.' },
  { step: 'Otimização', detail: 'Introduzir a estrutura/padrão e seu invariante.' },
  { step: 'Implementação', detail: 'Codificar explicando decisões, não cada linha.' },
  { step: 'Validação', detail: 'Dry run + bordas + Big-O + trade-off.' },
];
