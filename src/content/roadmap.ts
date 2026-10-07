/**
 * Catálogo do roadmap, derivado de `Roadmap_Live_Coding_Entrevistas.md`.
 * Isto é *conteúdo*, versionado pelo git — o progresso do usuário vive
 * separado, em `src/data/`. As colunas `whatToMaster` / `howFar` são as
 * mesmas do documento, para que a fonte permaneça rastreável.
 */

export type Priority = 'CORE' | 'ALTA' | 'MEDIA' | 'BAIXA';

export interface RoadmapTopic {
  id: string;
  sectionId: string;
  name: string;
  priority: Priority;
  /** Coluna "O que dominar" do documento. */
  whatToMaster: string;
  /** Coluna "Até onde estudar". */
  howFar: string;
  /** Rota própria quando o tópico tem conteúdo ou laboratório. */
  route?: string;
}

export interface RoadmapSection {
  id: string;
  /** Número do nível na trilha principal; ausente nas trilhas paralelas. */
  level?: number;
  title: string;
  subtitle: string;
  kind: 'principal' | 'paralela';
  /**
   * Peso na distribuição de esforço sugerida (§02). Normalizado no cálculo,
   * então os números não precisam somar exatamente 100.
   */
  roiWeight: number;
}

export const SECTIONS: RoadmapSection[] = [
  { id: 'n0', level: 0, title: 'Linguagem e execução', subtitle: 'Pré-requisitos operacionais.', kind: 'principal', roiWeight: 4 },
  { id: 'n1', level: 1, title: 'Complexidade e correção', subtitle: 'Análise antes do código.', kind: 'principal', roiWeight: 4 },
  { id: 'n2', level: 2, title: 'Arrays, Strings e Hashing', subtitle: 'A base da maior parte dos problemas.', kind: 'principal', roiWeight: 15 },
  { id: 'n3', level: 3, title: 'Padrões de varredura', subtitle: 'Automatizar reconhecimento e templates mínimos.', kind: 'principal', roiWeight: 15 },
  { id: 'n4', level: 4, title: 'Estruturas lineares auxiliares', subtitle: 'Quando LIFO/FIFO resolve o estado.', kind: 'principal', roiWeight: 7 },
  { id: 'n5', level: 5, title: 'Ordenação, Heap e Intervalos', subtitle: 'Ordenar como transformação do problema.', kind: 'principal', roiWeight: 7 },
  { id: 'n6', level: 6, title: 'Árvores', subtitle: 'Traversals e recursão automáticos.', kind: 'principal', roiWeight: 15 },
  { id: 'n7', level: 7, title: 'Grafos', subtitle: 'Base para praticamente todo o restante.', kind: 'principal', roiWeight: 15 },
  { id: 'n8', level: 8, title: 'Backtracking', subtitle: 'Modelar estado, escolhas, restrições e undo.', kind: 'principal', roiWeight: 6 },
  { id: 'n9', level: 9, title: 'Programação dinâmica', subtitle: 'Estado, transição e base — nessa ordem.', kind: 'principal', roiWeight: 15 },
  { id: 'n10', level: 10, title: 'Padrões avançados de alto ROI', subtitle: 'Treinar após o core estar consistente.', kind: 'principal', roiWeight: 3 },
  { id: 'n11', level: 11, title: 'Cauda longa', subtitle: 'Conforme a vaga, ou após ampla consolidação.', kind: 'principal', roiWeight: 2 },

  { id: 'p-performance', title: 'Performance em Live Coding', subtitle: 'Roda em paralelo desde o primeiro dia.', kind: 'paralela', roiWeight: 0 },
  { id: 'p-metodo', title: 'Método de estudo', subtitle: 'Reconhecimento, retenção e execução sob pressão.', kind: 'paralela', roiWeight: 0 },
  { id: 'p-design', title: 'Design', subtitle: 'Peso depende do nível da vaga.', kind: 'paralela', roiWeight: 0 },
];

export const TOPICS: RoadmapTopic[] = [
  // ── Nível 0 ──
  { id: 'fluencia-linguagem', sectionId: 'n0', name: 'Fluência na linguagem', priority: 'CORE', whatToMaster: 'Built-ins, collections, iteração, slicing, sort, comparator/key, heap/deque da linguagem.', howFar: 'Treinar até escrever solução comum sem consulta.' },
  { id: 'custo-operacoes', sectionId: 'n0', name: 'Custo das operações nativas', priority: 'CORE', whatToMaster: 'Acesso, append, insert/remove, lookup em hash, sort, heap ops.', howFar: 'Saber os custos práticos mais usados.' },
  { id: 'recursao', sectionId: 'n0', name: 'Recursão', priority: 'CORE', whatToMaster: 'Caso base, call stack, retorno, árvore de chamadas, versão iterativa.', howFar: 'Essencial para trees, DFS, backtracking e DP.' },
  { id: 'editor-testes', sectionId: 'n0', name: 'Editor, execução e testes', priority: 'ALTA', whatToMaster: 'Rodar código, ler erro, escrever testes rápidos.', howFar: 'Debugger é útil; não dependa dele.' },
  { id: 'git', sectionId: 'n0', name: 'Git', priority: 'BAIXA', whatToMaster: 'Não é conteúdo típico do live coding algorítmico.', howFar: 'Competência profissional, fora do core deste roadmap.' },

  // ── Nível 1 ──
  { id: 'big-o', sectionId: 'n1', name: 'Big-O de tempo e espaço', priority: 'CORE', whatToMaster: 'Loops, nested loops, recursão, estruturas auxiliares.', howFar: 'Explicar a solução final e as alternativas.' },
  { id: 'constraint-alvo', sectionId: 'n1', name: 'Constraint → complexidade alvo', priority: 'CORE', whatToMaster: 'Inferir O(n), O(n log n), O(n²), exponencial.', howFar: 'Transformar constraints em pista de solução.' },
  { id: 'trade-off', sectionId: 'n1', name: 'Trade-off tempo × memória', priority: 'CORE', whatToMaster: 'Hashing, memoização, pré-processamento.', howFar: 'Conseguir justificar a troca.' },
  { id: 'invariantes', sectionId: 'n1', name: 'Invariantes e correção', priority: 'CORE', whatToMaster: 'O que permanece verdadeiro durante o algoritmo.', howFar: 'Explicação informal clara é suficiente.' },
  { id: 'amortizada', sectionId: 'n1', name: 'Análise amortizada', priority: 'MEDIA', whatToMaster: 'Dynamic array e, eventualmente, hash table.', howFar: 'Sem método potencial/contábil aprofundado.' },

  // ── Nível 2 ──
  { id: 'array-string', sectionId: 'n2', name: 'Array e String', priority: 'CORE', whatToMaster: 'Traversal, índices, in-place, frequência, ordenação, substring/subarray.', howFar: 'Domínio profundo.' },
  { id: 'matrix', sectionId: 'n2', name: 'Matrix / 2D Array', priority: 'ALTA', whatToMaster: 'Traversal, vizinhos, boundaries, rotate/spiral, marcação in-place.', howFar: 'Separar "matrix" de "grid como grafo".' },
  { id: 'hash-map-set', sectionId: 'n2', name: 'Hash Map / Hash Set', priority: 'CORE', whatToMaster: 'Frequência, membership, deduplicação, indexação, complementos.', howFar: 'Estrutura auxiliar de altíssimo retorno.' },

  // ── Nível 3 ──
  { id: 'two-pointers', sectionId: 'n3', name: 'Two Pointers', priority: 'CORE', whatToMaster: 'Opposite ends, same direction, partition, sorted array.', howFar: 'Reconhecer quando ordenar ajuda.', route: '/topico/two-pointers' },
  { id: 'sliding-window', sectionId: 'n3', name: 'Sliding Window', priority: 'CORE', whatToMaster: 'Janela fixa e variável; contador/frequência.', howFar: 'Saber expandir, validar e contrair.' },
  { id: 'prefix-sum', sectionId: 'n3', name: 'Prefix Sum', priority: 'CORE', whatToMaster: 'Range sum, contagem de subarrays, prefix map.', howFar: 'Difference Array é extensão secundária.' },
  { id: 'binary-search', sectionId: 'n3', name: 'Binary Search', priority: 'CORE', whatToMaster: 'Busca padrão, lower/upper bound conceitual, limites.', howFar: 'Evitar off-by-one e definir o predicado.' },

  // ── Nível 4 ──
  { id: 'stack-queue-deque', sectionId: 'n4', name: 'Stack / Queue / Deque', priority: 'ALTA', whatToMaster: 'Parsing, matching, BFS, janela, ordem de processamento.', howFar: 'Saber quando LIFO/FIFO resolve o estado.' },
  { id: 'linked-list', sectionId: 'n4', name: 'Linked List', priority: 'ALTA', whatToMaster: 'Reverse, merge, cycle, middle, dummy node.', howFar: 'Não aprofundar em operações exóticas.' },

  // ── Nível 5 ──
  { id: 'sorting', sectionId: 'n5', name: 'Sorting', priority: 'CORE', whatToMaster: 'Ordenar como transformação; custom key/comparator; estabilidade.', howFar: 'Merge/Quick conceitualmente; Timsort interno é baixo ROI.' },
  { id: 'heap', sectionId: 'n5', name: 'Heap / Priority Queue', priority: 'ALTA', whatToMaster: 'Top-K, K-ésimo, streaming, merge K listas, min/max heap.', howFar: 'Two-heaps como subpadrão posterior.' },
  { id: 'intervals', sectionId: 'n5', name: 'Intervals', priority: 'ALTA', whatToMaster: 'Sort + merge, overlap, meeting rooms.', howFar: 'Sweep line é uma extensão média.' },
  { id: 'greedy', sectionId: 'n5', name: 'Greedy', priority: 'ALTA', whatToMaster: 'Sort+greedy, interval scheduling, escolha local, Jump Game.', howFar: 'Explicar por que a escolha é segura.' },

  // ── Nível 6 ──
  { id: 'binary-trees', sectionId: 'n6', name: 'Binary Trees', priority: 'CORE', whatToMaster: 'DFS/BFS, height/depth, path, subtree, LCA.', howFar: 'Automatizar o recursion pattern.' },
  { id: 'bst', sectionId: 'n6', name: 'BST', priority: 'ALTA', whatToMaster: 'Ordering invariant, search/insert, validate, k-ésimo.', howFar: 'Usar o invariante para eliminar espaço de busca.' },

  // ── Nível 7 ──
  { id: 'graphs-bfs-dfs', sectionId: 'n7', name: 'Grafos: BFS e DFS', priority: 'CORE', whatToMaster: 'Adjacency list, visited, componentes, grid.', howFar: 'Base para praticamente todo o restante.', route: '/lab/grafos' },
  { id: 'multi-source-bfs', sectionId: 'n7', name: 'Multi-source BFS', priority: 'ALTA', whatToMaster: 'Várias origens na fila inicial.', howFar: 'Padrão pequeno, mas de alto retorno.' },
  { id: 'cycle-topological', sectionId: 'n7', name: 'Ciclo e Ordenação topológica', priority: 'ALTA', whatToMaster: 'Dirigido vs não dirigido, indegree/Kahn ou DFS colors.', howFar: 'Saber reconhecer dependências.' },
  { id: 'union-find', sectionId: 'n7', name: 'Union-Find', priority: 'MEDIA', whatToMaster: 'find, union, path compression, rank/size.', howFar: 'Conectividade dinâmica; depois de BFS/DFS.' },
  { id: 'dijkstra', sectionId: 'n7', name: 'Dijkstra', priority: 'MEDIA', whatToMaster: 'Shortest path com pesos não-negativos + heap.', howFar: 'Não confundir com BFS sem peso.', route: '/lab/grafos' },

  // ── Nível 8 ──
  { id: 'backtracking', sectionId: 'n8', name: 'Backtracking', priority: 'ALTA', whatToMaster: 'Subsets, permutations, combinations, constraints, undo.', howFar: 'Dominar árvore de decisões e poda.', route: '/lab/grafos' },
  { id: 'poda', sectionId: 'n8', name: 'Poda', priority: 'ALTA', whatToMaster: 'Interromper ramos impossíveis ou piores.', howFar: 'Aplicar dentro do backtracking.' },

  // ── Nível 9 ──
  { id: 'dp-estado-transicao', sectionId: 'n9', name: 'DP: estado, transição e base', priority: 'CORE', whatToMaster: 'Definir dp[i], dependências, memoização e tabulação.', howFar: 'Essência de DP; não decorar fórmula isolada.' },
  { id: 'dp-1d-grid', sectionId: 'n9', name: 'DP 1D e Grid', priority: 'ALTA', whatToMaster: 'House Robber, climbing stairs, coin/paths básicos.', howFar: 'Primeiro conjunto a dominar.' },
  { id: 'knapsack-lcs-lis', sectionId: 'n9', name: 'Knapsack / LCS / LIS', priority: 'MEDIA', whatToMaster: 'Famílias clássicas para ampliar repertório.', howFar: 'Treinar após DP fundamental.' },
  { id: 'edit-distance', sectionId: 'n9', name: 'Edit Distance', priority: 'MEDIA', whatToMaster: 'DP 2D de sequência.', howFar: 'Útil, mas abaixo de LCS/LIS no ROI.' },

  // ── Nível 10 ──
  { id: 'monotonic-stack', sectionId: 'n10', name: 'Monotonic Stack', priority: 'MEDIA', whatToMaster: 'Next greater/smaller, temperatures, histogram.', howFar: 'Bom ROI depois do core.' },
  { id: 'monotonic-deque', sectionId: 'n10', name: 'Monotonic Deque', priority: 'MEDIA', whatToMaster: 'Sliding Window Maximum e variantes.', howFar: 'Mais nichado que monotonic stack.' },
  { id: 'divide-conquer', sectionId: 'n10', name: 'Divide & Conquer', priority: 'MEDIA', whatToMaster: 'Dividir, resolver, combinar.', howFar: 'Via merge sort, quicksort, binary search e árvores.' },
  { id: 'binary-search-resposta', sectionId: 'n10', name: 'Binary Search na resposta', priority: 'MEDIA', whatToMaster: 'Definir o predicado monotônico sobre o espaço de respostas.', howFar: 'Treinar após o binary search clássico.' },
  { id: 'trie', sectionId: 'n10', name: 'Trie', priority: 'MEDIA', whatToMaster: 'Inserção, busca por prefixo, nós terminais.', howFar: 'Depois do core consistente.' },

  // ── Nível 11 ──
  { id: 'dp-avancado', sectionId: 'n11', name: 'Tree / Interval / Bitmask DP', priority: 'BAIXA', whatToMaster: 'DP especializado.', howFar: 'Somente após forte domínio do restante.' },
  { id: 'bits', sectionId: 'n11', name: 'Bit manipulation', priority: 'MEDIA', whatToMaster: 'AND/OR/XOR, shifts, masks simples.', howFar: 'Básico; não priorizar tricks.' },
  { id: 'matematica', sectionId: 'n11', name: 'GCD, primos e modular', priority: 'MEDIA', whatToMaster: 'Euclides, sieve básico, overflow/mod.', howFar: 'Dependente do perfil da empresa.' },
  { id: 'grafos-avancados', sectionId: 'n11', name: 'MST / Bellman-Ford / Floyd-Warshall', priority: 'BAIXA', whatToMaster: 'Grafos avançados e shortest paths específicos.', howFar: 'Cauda longa.' },
  { id: 'fenwick-segtree', sectionId: 'n11', name: 'Fenwick / Segment Tree', priority: 'BAIXA', whatToMaster: 'Range query e update.', howFar: 'Só em entrevistas competitivas.' },
  { id: 'kmp-rabin-karp', sectionId: 'n11', name: 'KMP / Rabin-Karp', priority: 'BAIXA', whatToMaster: 'Pattern matching avançado.', howFar: 'Últimos tópicos do roadmap.' },

  // ── Trilha paralela: Performance ──
  { id: 'clarificar', sectionId: 'p-performance', name: 'Clarificar requisitos', priority: 'CORE', whatToMaster: 'Entradas, saídas, constraints, duplicados, vazio, mutabilidade.', howFar: 'Sempre antes de codificar.' },
  { id: 'verbalizar', sectionId: 'p-performance', name: 'Verbalizar raciocínio', priority: 'CORE', whatToMaster: 'Explicar hipótese, alternativas e decisão.', howFar: 'Verbalizar decisões, não sintaxe.' },
  { id: 'brute-force-otimizar', sectionId: 'p-performance', name: 'Brute force → otimizar', priority: 'CORE', whatToMaster: 'Mostrar solução simples correta e localizar o gargalo.', howFar: 'Usar como ponte para o padrão ótimo.' },
  { id: 'dry-run', sectionId: 'p-performance', name: 'Dry run manual', priority: 'CORE', whatToMaster: 'Executar em exemplo pequeno antes de rodar.', howFar: 'Principal defesa contra bugs lógicos.' },
  { id: 'casos-borda', sectionId: 'p-performance', name: 'Casos de borda', priority: 'CORE', whatToMaster: 'Vazio, 1 item, duplicados, limites, off-by-one, degenerados.', howFar: 'Criar checklist automático.' },
  { id: 'complexidade-final', sectionId: 'p-performance', name: 'Complexidade final', priority: 'CORE', whatToMaster: 'Tempo + espaço + trade-offs.', howFar: 'Declarar no fim da solução.' },
  { id: 'debug-pressao', sectionId: 'p-performance', name: 'Debug sob pressão', priority: 'ALTA', whatToMaster: 'Ler stack trace, isolar hipótese, testar mínimo.', howFar: 'Corrigir sistematicamente, sem chutar.' },
  { id: 'codigo-legivel', sectionId: 'p-performance', name: 'Código legível', priority: 'CORE', whatToMaster: 'Nomes, funções curtas, sem clever code.', howFar: 'O entrevistador precisa acompanhar.' },
  { id: 'ler-codigo-alheio', sectionId: 'p-performance', name: 'Ler e estender código alheio', priority: 'ALTA', whatToMaster: 'Entender fluxo, invariantes e impacto da mudança.', howFar: 'Importante em entrevistas realistas.' },
  { id: 'rodada-ia', sectionId: 'p-performance', name: 'Rodada assistida por IA', priority: 'MEDIA', whatToMaster: 'Delegar, auditar, testar, achar hallucinations e bugs.', howFar: 'Só quando o formato permitir IA.' },

  // ── Trilha paralela: Método ──
  { id: 'pratica-bloqueada', sectionId: 'p-metodo', name: 'Prática bloqueada inicial', priority: 'ALTA', whatToMaster: 'Várias questões do mesmo padrão enquanto ele é novo.', howFar: 'Serve para adquirir o padrão.' },
  { id: 'pratica-intercalada', sectionId: 'p-metodo', name: 'Prática intercalada', priority: 'CORE', whatToMaster: 'Misturar padrões quando já existe repertório.', howFar: 'Treina reconhecimento sem rótulo.' },
  { id: 'repeticao-espacada', sectionId: 'p-metodo', name: 'Repetição espaçada', priority: 'CORE', whatToMaster: 'Revisitar questões e padrões em intervalos crescentes.', howFar: 'Foco no que quase foi esquecido.' },
  { id: 'caderno-padroes', sectionId: 'p-metodo', name: 'Caderno de padrões', priority: 'ALTA', whatToMaster: 'Sinal → ideia → invariante → template → erros comuns.', howFar: 'Não virar coleção de soluções completas.' },
  { id: 'error-log', sectionId: 'p-metodo', name: 'Error log', priority: 'CORE', whatToMaster: 'Registrar por que errou: reconhecimento, modelagem, implementação, borda.', howFar: 'Revisar erros recorrentes semanalmente.' },
  { id: 'mock-cronometrado', sectionId: 'p-metodo', name: 'Mock cronometrado', priority: 'CORE', whatToMaster: 'Resolver falando, com tempo limitado e sem pista de tópico.', howFar: 'Obrigatório nas semanas antes da entrevista.' },
  { id: 're-solve', sectionId: 'p-metodo', name: 'Re-solve sem olhar', priority: 'CORE', whatToMaster: 'Refazer a solução depois de alguns dias.', howFar: 'Critério real de retenção.' },

  // ── Trilha paralela: Design ──
  { id: 'lld-oop', sectionId: 'p-design', name: 'LLD / OOP', priority: 'ALTA', whatToMaster: 'Responsabilidades, interfaces, composição, extensibilidade, testabilidade.', howFar: 'Entender o problema que cada padrão resolve.' },
  { id: 'solid', sectionId: 'p-design', name: 'SOLID', priority: 'MEDIA', whatToMaster: 'Princípios como heurísticas de design.', howFar: 'Saber aplicar, não recitar siglas.' },
  { id: 'design-patterns', sectionId: 'p-design', name: 'Design Patterns', priority: 'MEDIA', whatToMaster: 'Factory, Strategy, Observer, Adapter e equivalentes.', howFar: 'Poucos padrões bem entendidos > catálogo inteiro.' },
  { id: 'system-design', sectionId: 'p-design', name: 'System Design', priority: 'MEDIA', whatToMaster: 'Caching, DB, filas, consistência, partitioning, idempotência.', howFar: 'Baixa para júnior; alta para mid/sênior.' },
];

export function topicsOf(sectionId: string): RoadmapTopic[] {
  return TOPICS.filter((t) => t.sectionId === sectionId);
}

export function getTopic(id: string): RoadmapTopic | undefined {
  return TOPICS.find((t) => t.id === id);
}

export function getSection(id: string): RoadmapSection | undefined {
  return SECTIONS.find((s) => s.id === id);
}

export const PRIORITY_LABEL: Record<Priority, string> = {
  CORE: 'CORE',
  ALTA: 'ALTA',
  MEDIA: 'MÉDIA',
  BAIXA: 'BAIXA',
};

export const PRIORITY_COLOR: Record<Priority, string> = {
  CORE: 'var(--color-prio-core)',
  ALTA: 'var(--color-prio-alta)',
  MEDIA: 'var(--color-prio-media)',
  BAIXA: 'var(--color-prio-baixa)',
};
