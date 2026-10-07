# Roadmap — Live Coding para Entrevistas de Software

> Fundamentos, padrões, estruturas e performance — priorizados por retorno prático.

## Objetivo

Construir competência suficiente para reconhecer padrões, formular uma solução, codificá-la corretamente e defendê-la em voz alta durante entrevistas de live coding — sem transformar a preparação em um curso enciclopédico de algoritmos.

| Prioridade | Significado |
|---|---|
| **CORE** | Domínio obrigatório. Deve ficar automático. |
| **ALTA** | Frequente ou com excelente retorno em entrevistas. |
| **MÉDIA** | Importante em processos mais exigentes ou como extensão do core. |
| **BAIXA** | Cauda longa. Estude depois que o restante estiver sólido. |

## Princípio central

**Profundidade em 15–20 padrões recorrentes > exposição superficial a dezenas de algoritmos avançados.**

## 01 — Como usar este roadmap

Estude na ordem apresentada. A Trilha de Live Coding roda em paralelo desde o começo.

> **Regra de progressão:** não avance porque “vi a teoria”. Avance quando consegue identificar o padrão, explicar a complexidade, implementar sem depender de consulta e testar casos de borda.

### Distribuição de esforço sugerida

| **Bloco**                                                                            | **Fatia aproximada do estudo** |
|--------------------------------------------------------------------------------------|--------------------------------|
| Arrays / Strings / Hashing + padrões de varredura + árvores / grafos / binary search | **~60%**                       |
| Heap / intervalos / backtracking / greedy / linked list / stack / queue              | **~20%**                       |
| Programação dinâmica fundamental                                                     | **~15%**                       |
| Cauda longa e algoritmos especializados                                              | **~5%**                        |

### Fluxo mental esperado em qualquer questão

1. Clarificar entrada, saída, restrições e casos ambíguos.

2. Derivar a complexidade alvo a partir das constraints.

3. Propor brute force e identificar o gargalo.

4. Reconhecer o sinal do padrão/estrutura que remove esse gargalo.

5. Explicar o invariante ou argumento de correção.

6. Implementar de forma legível.

7. Fazer dry run e testar casos de borda.

8. Declarar complexidade final e trade-offs.

## 02 — Roadmap principal

A ordem abaixo substitui uma progressão por “quantidade de assuntos” por uma progressão por retorno de entrevista.

| **Tópico**                               | **Prioridade** | **O que dominar**                                                                      | **Até onde estudar**                                                      |
|------------------------------------------|----------------|----------------------------------------------------------------------------------------|---------------------------------------------------------------------------|
| Nível 0 — Linguagem e execução           | **CORE**       | Sintaxe, built-ins, collections, sort/comparator, strings, loops, funções, I/O básico. | Codificar sem documentação na maior parte do tempo.                       |
| Nível 1 — Complexidade e correção        | **CORE**       | Big-O tempo/espaço, constraints → alvo, trade-off tempo×memória, invariantes.          | Amortizada só no necessário; sem formalismo acadêmico excessivo.          |
| Nível 2 — Arrays / Strings / Hashing     | **CORE**       | Array, string, matrix básica, Hash Map, Hash Set.                                      | Domínio profundo; são a base da maior parte dos problemas.                |
| Nível 3 — Padrões de varredura           | **CORE**       | Two Pointers, Sliding Window, Prefix Sum, Binary Search.                               | Automatizar reconhecimento e templates mínimos.                           |
| Nível 4 — Estruturas lineares auxiliares | **ALTA**       | Stack, Queue, Deque, Linked List; fast/slow como subpadrão.                            | Linked List: reverse, merge, cycle, dummy node, manipulação de ponteiros. |
| Nível 5 — Ordenação / Heap / Intervalos  | **ALTA**       | Sorting como ferramenta, Heap/PQ, merge intervals, greedy básico.                      | Timsort interno não é prioridade; sweep line fica depois.                 |
| Nível 6 — Árvores                        | **CORE**       | DFS pré/in/pós, BFS por nível, altura, subtree, paths, LCA, BST.                       | Traversals e recursão devem ficar automáticos.                            |
| Nível 7 — Grafos                         | **CORE**       | Representação, BFS, DFS, grid, componentes, ciclo, topo sort.                          | Union-Find e Dijkstra entram após o core de BFS/DFS.                      |
| Nível 8 — Backtracking                   | **ALTA**       | Subsets, permutações, combinações, poda.                                               | Modelar estado, escolhas, restrições e undo.                              |
| Nível 9 — Programação dinâmica           | **ALTA**       | Recursão → memo → tabulação, estado, transição, base, DP 1D/grid.                      | Primeiro compreender estado/transição; depois famílias clássicas.         |
| Nível 10 — Padrões avançados de alto ROI | **MÉDIA**      | Monotonic Stack, Union-Find, Dijkstra, Binary Search na resposta, Trie.                | Treinar após o core estar consistente.                                    |
| Nível 11 — Cauda longa                   | **BAIXA**      | Advanced DP/graphs, bits, matemática, Fenwick, Segment Tree, KMP/Rabin-Karp.           | Somente conforme vaga/empresa ou após ampla consolidação.                 |

## 03 — Conteúdo por nível

O que manter, reduzir, mover ou acrescentar em relação ao roadmap original.

## Nível 0 — Pré-requisitos

| **Tópico**                  | **Prioridade** | **O que dominar**                                                                         | **Até onde estudar**                                              |
|-----------------------------|----------------|-------------------------------------------------------------------------------------------|-------------------------------------------------------------------|
| Fluência na linguagem       | **CORE**       | Built-ins, collections, iteração, slicing, sort, comparator/key, heap/deque da linguagem. | Treinar até escrever solução comum sem consulta.                  |
| Custo das operações nativas | **CORE**       | Acesso, append, insert/remove, lookup em hash, sort, heap ops.                            | Saber custos práticos mais usados.                                |
| Recursão                    | **CORE**       | Caso base, call stack, retorno, árvore de chamadas, versão iterativa.                     | Essencial para trees, DFS, backtracking e DP.                     |
| Editor / execução / testes  | **ALTA**       | Rodar código, ler erro, escrever testes rápidos.                                          | Debugger útil; não dependa dele.                                  |
| Git                         | **BAIXA**      | Não é conteúdo típico do live coding algorítmico.                                         | Manter como competência profissional, fora do core deste roadmap. |

## Nível 1 — Análise e correção

| **Tópico**                          | **Prioridade** | **O que dominar**                                     | **Até onde estudar**                                 |
|-------------------------------------|----------------|-------------------------------------------------------|------------------------------------------------------|
| Big-O tempo e espaço                | **CORE**       | Loops, nested loops, recursão, estruturas auxiliares. | Explicar a solução final e alternativas.             |
| Constraint → complexidade alvo      | **CORE**       | Inferir O(n), O(n log n), O(n²), exponencial etc.     | Transformar constraints em pista de solução.         |
| Trade-off tempo × memória           | **CORE**       | Hashing, memoização, pré-processamento.               | Conseguir justificar a troca.                        |
| Invariantes / argumento de correção | **CORE**       | O que permanece verdadeiro durante o algoritmo.       | Explicação informal clara é suficiente.              |
| Análise amortizada                  | **MÉDIA**      | Dynamic array, eventualmente hash table.              | Não estudar método potencial/contábil profundamente. |

## Níveis 2–4 — Base operacional

| **Tópico**            | **Prioridade** | **O que dominar**                                                        | **Até onde estudar**                     |
|-----------------------|----------------|--------------------------------------------------------------------------|------------------------------------------|
| Array / String        | **CORE**       | Traversal, índices, in-place, frequência, ordenação, substring/subarray. | Domínio profundo.                        |
| Matrix / 2D Array     | **ALTA**       | Traversal, vizinhos, boundaries, rotate/spiral, marcação in-place.       | Separar “matrix” de “grid como grafo”.   |
| Hash Map / Set        | **CORE**       | Frequência, membership, deduplicação, indexação, complementos.           | Estrutura auxiliar de altíssimo retorno. |
| Two Pointers          | **CORE**       | Opposite ends, same direction, partition, sorted array.                  | Reconhecer quando ordenar ajuda.         |
| Sliding Window        | **CORE**       | Janela fixa e variável; contador/frequência.                             | Saber expandir, validar e contrair.      |
| Prefix Sum            | **CORE**       | Range sum, contagem de subarrays, prefix map.                            | Difference Array é extensão secundária.  |
| Binary Search         | **CORE**       | Busca padrão, lower/upper bound conceitual, limites.                     | Evitar off-by-one e definir o predicado. |
| Stack / Queue / Deque | **ALTA**       | Parsing, matching, BFS, janela, ordem de processamento.                  | Saber quando LIFO/FIFO resolve o estado. |
| Linked List           | **ALTA**       | Reverse, merge, cycle, middle, dummy node.                               | Não aprofundar em operações exóticas.    |

## Níveis 5–7 — Hierarquia, árvores e grafos

| **Tópico**            | **Prioridade** | **O que dominar**                                                            | **Até onde estudar**                                                           |
|-----------------------|----------------|------------------------------------------------------------------------------|--------------------------------------------------------------------------------|
| Sorting               | **CORE**       | Ordenar como transformação do problema; custom key/comparator; estabilidade. | Conhecer Merge Sort / Quick Sort conceitualmente; Timsort interno é baixo ROI. |
| Heap / Priority Queue | **ALTA**       | Top-K, K-th, streaming, merge K lists/arrays, min/max heap.                  | Two-heaps como subpadrão posterior.                                            |
| Intervals             | **ALTA**       | Sort + merge, overlap, meeting rooms.                                        | Sweep line é uma extensão média.                                               |
| Greedy                | **ALTA**       | Sort+greedy, interval scheduling, escolha local, Jump Game etc.              | Subir da cauda longa; explicar por que a escolha é segura.                     |
| Monotonic Stack       | **MÉDIA**      | Next greater/smaller, temperatures, histogram.                               | Bom ROI depois do core.                                                        |
| Monotonic Deque       | **MÉDIA**      | Sliding Window Maximum e variantes.                                          | Mais nichado que monotonic stack.                                              |
| Binary Trees          | **CORE**       | DFS/BFS, height/depth, path, subtree, LCA.                                   | Automatizar recursion pattern.                                                 |
| BST                   | **ALTA**       | Ordering invariant, search/insert, validate, kth.                            | Usar o invariante para eliminar espaço de busca.                               |
| Graphs: BFS/DFS       | **CORE**       | Adjacency list, visited, components, grid.                                   | Base para praticamente todo o restante.                                        |
| Multi-source BFS      | **ALTA**       | Várias origens na fila inicial.                                              | Padrão pequeno, mas de alto retorno.                                           |
| Cycle / Topological   | **ALTA**       | Dirigido vs não dirigido, indegree/Kahn ou DFS colors.                       | Saber reconhecer dependências.                                                 |
| Union-Find            | **MÉDIA**      | find, union, path compression, rank/size.                                    | Conectividade dinâmica; estudar depois de BFS/DFS.                             |
| Dijkstra              | **MÉDIA**      | Shortest path com pesos não-negativos + heap.                                | Não confundir com BFS sem peso.                                                |

## Níveis 8–11 — Recursão, DP e cauda longa

| **Tópico**                          | **Prioridade** | **O que dominar**                                       | **Até onde estudar**                                                |
|-------------------------------------|----------------|---------------------------------------------------------|---------------------------------------------------------------------|
| Backtracking                        | **ALTA**       | Subsets, permutations, combinations, constraints, undo. | Dominar árvore de decisões e poda.                                  |
| Poda                                | **ALTA**       | Interromper ramos impossíveis ou piores.                | Aplicar dentro do backtracking; não precisa módulo separado grande. |
| Divide & Conquer                    | **MÉDIA**      | Dividir, resolver, combinar.                            | Aprender via merge sort, quicksort, binary search e árvores.        |
| DP: estado/transição/base           | **CORE**       | Definir dp[i], dependências, memoização e tabulação.  | Essência de DP; não decorar fórmula isolada.                        |
| DP 1D / Grid                        | **ALTA**       | House Robber, climbing stairs, coin/paths básicos.      | Primeiro conjunto a dominar.                                        |
| Knapsack / LCS / LIS                | **MÉDIA**      | Famílias clássicas para ampliar repertório.             | Treinar após DP fundamental.                                        |
| Edit Distance                       | **MÉDIA**      | DP 2D de sequência.                                     | Útil, mas abaixo de LCS/LIS no ROI geral.                           |
| Tree / Interval / Bitmask DP        | **BAIXA**      | DP especializado.                                       | Somente após forte domínio do restante.                             |
| Bit manipulation                    | **MÉDIA**      | AND/OR/XOR, shifts, masks simples.                      | Conhecimento básico; não priorizar tricks.                          |
| GCD / primos / modular              | **MÉDIA**      | Euclides, sieve básico, overflow/mod.                   | Dependente do perfil da empresa.                                    |
| MST / Bellman-Ford / Floyd-Warshall | **BAIXA**      | Grafos avançados / shortest paths específicos.          | Cauda longa.                                                        |
| Fenwick / Segment Tree              | **BAIXA**      | Range query/update.                                     | Priorizar apenas em entrevistas competitivas/específicas.           |
| KMP / Rabin-Karp                    | **BAIXA**      | Pattern matching avançado.                              | Últimos tópicos do roadmap.                                         |

## 04 — Reconhecimento de sinais

O objetivo real da prática é reconhecer a estrutura escondida no enunciado.

| **Sinal no problema**                   | **Suspeite primeiro de**               |
|-----------------------------------------|----------------------------------------|
| Frequência, duplicado, “já vi?”         | **Hash Map / Hash Set**                |
| Par/tripla em array ordenado            | **Two Pointers**                       |
| Substring ou subarray contínuo          | **Sliding Window / Prefix Sum**        |
| Consulta repetida de soma em intervalo  | **Prefix Sum**                         |
| “Menor/maior valor que ainda satisfaz…” | **Binary Search na resposta**          |
| Top K / K-th / próximo item prioritário | **Heap**                               |
| Próximo maior/menor elemento            | **Monotonic Stack**                    |
| Intervalos sobrepostos                  | **Sorting + Intervals**                |
| Dependências / pré-requisitos           | **Topological Sort**                   |
| Ilhas / regiões / componentes           | **DFS / BFS / Union-Find**             |
| Menor caminho sem peso                  | **BFS**                                |
| Menor caminho com peso não-negativo     | **Dijkstra**                           |
| Todas as combinações válidas            | **Backtracking**                       |
| Subproblemas repetidos + escolha ótima  | **Dynamic Programming**                |
| Escolha local parece suficiente         | **Greedy — mas justifique a correção** |

## 05 — Trilha paralela: Performance em Live Coding

Começa no primeiro dia e deve ser praticada em toda questão, não apenas em mocks.

| **Tópico**                 | **Prioridade** | **O que dominar**                                               | **Até onde estudar**                                |
|----------------------------|----------------|-----------------------------------------------------------------|-----------------------------------------------------|
| Clarificar requisitos      | **CORE**       | Entradas, saídas, constraints, duplicados, vazio, mutabilidade. | Sempre antes de codificar.                          |
| Verbalizar raciocínio      | **CORE**       | Explicar hipótese, alternativas e decisão.                      | Evitar narrar sintaxe; verbalizar decisões.         |
| Brute force → otimizar     | **CORE**       | Mostrar uma solução correta simples e localizar o gargalo.      | Usar isso como ponte para o padrão ótimo.           |
| Dry run manual             | **CORE**       | Executar em exemplo pequeno antes de rodar.                     | Principal defesa contra bugs lógicos.               |
| Casos de borda             | **CORE**       | Vazio, 1 item, duplicados, limites, off-by-one, degenerados.    | Criar checklist automático.                         |
| Complexidade final         | **CORE**       | Tempo + espaço + trade-offs.                                    | Declarar no fim da solução.                         |
| Debug sob pressão          | **ALTA**       | Ler stack trace/erro, isolar hipótese, testar mínimo.           | Corrigir sistematicamente sem “chutar”.             |
| Código legível             | **CORE**       | Nomes, funções curtas, sem clever code desnecessário.           | Entrevistador precisa acompanhar.                   |
| Ler/estender código alheio | **ALTA**       | Entender fluxo, invariantes e impacto da mudança.               | Importante para entrevistas mais realistas.         |
| Rodada assistida por IA    | **MÉDIA**      | Delegar, auditar, testar, encontrar hallucinations/bugs.        | Somente quando o formato da entrevista permitir IA. |

## Script mental de 7 etapas

- Clarificar: “Posso assumir X? Há duplicados? Qual o tamanho máximo?”

- Exemplo: criar um caso pequeno e confirmar interpretação.

- Brute force: descrever a solução mais simples e seu custo.

- Gargalo: apontar exatamente o que torna a abordagem lenta.

- Otimização: introduzir estrutura/padrão e seu invariante.

- Implementação: codificar enquanto explica decisões, não cada linha.

- Validação: dry run + bordas + Big-O + trade-off.

## 06 — Trilha paralela: Método de estudo

O treinamento deve melhorar reconhecimento, retenção e execução sob pressão.

| **Tópico**                | **Prioridade** | **O que dominar**                                                         | **Até onde estudar**                             |
|---------------------------|----------------|---------------------------------------------------------------------------|--------------------------------------------------|
| Prática bloqueada inicial | **ALTA**       | Várias questões do mesmo padrão enquanto ele é novo.                      | Serve para adquirir o padrão.                    |
| Prática intercalada       | **CORE**       | Misturar padrões quando já existe repertório.                             | Serve para treinar reconhecimento sem rótulo.    |
| Repetição espaçada        | **CORE**       | Revisitar questões/padrões em intervalos crescentes.                      | Foco no que quase foi esquecido.                 |
| Caderno de padrões        | **ALTA**       | Sinal → ideia → invariante → template → erros comuns.                     | Não virar coleção de soluções completas.         |
| Error log                 | **CORE**       | Registrar por que errou: reconhecimento, modelagem, implementação, borda. | Revisar erros recorrentes semanalmente.          |
| Mock cronometrado         | **CORE**       | Resolver falando, com tempo limitado e sem pista de tópico.               | Obrigatório nas semanas anteriores à entrevista. |
| Re-solve sem olhar        | **CORE**       | Refazer solução depois de alguns dias.                                    | Critério real de retenção.                       |

## 07 — Trilha paralela: Design

Mantenha separada do core algorítmico; a prioridade depende do nível da vaga.

**Para estágio / júnior:** modelagem básica e código bem estruturado têm maior retorno do que System Design profundo.

**Para mid / sênior:** LLD e System Design passam a ter peso próprio e devem virar trilhas específicas de preparação.

| **Tópico**      | **Prioridade** | **O que dominar**                                                              | **Até onde estudar**                                                 |
|-----------------|----------------|--------------------------------------------------------------------------------|----------------------------------------------------------------------|
| LLD / OOP       | **ALTA**       | Responsabilidades, interfaces, composição, extensibilidade, testabilidade.     | Não decorar padrões de projeto sem entender o problema que resolvem. |
| SOLID           | **MÉDIA**      | Princípios como heurísticas de design.                                         | Saber aplicar, não recitar siglas.                                   |
| Design Patterns | **MÉDIA**      | Factory/Strategy/Observer/Adapter ou equivalentes comuns.                      | Poucos padrões bem entendidos > catálogo inteiro.                   |
| System Design   | **MÉDIA**      | Caching, DB, filas, consistência, partitioning, idempotência, observabilidade. | Baixa prioridade para júnior; alta para mid/sênior.                  |

## 08 — Critérios de domínio

Use critérios observáveis para decidir se um tópico está “pronto”.

| **Dimensão**       | **Critério**                                                                       |
|--------------------|------------------------------------------------------------------------------------|
| **Reconhecimento** | Em um problema novo, levantar 1–3 padrões plausíveis sem receber o nome do tópico. |
| **Modelagem**      | Definir estado, invariantes, estruturas e limites antes do código.                 |
| **Implementação**  | Escrever a solução comum sem depender de copiar template.                          |
| **Correção**       | Explicar por que o algoritmo funciona, ainda que informalmente.                    |
| **Complexidade**   | Derivar Big-O de tempo e espaço corretamente.                                      |
| **Validação**      | Criar casos normais e de borda e executar dry run.                                 |
| **Retenção**       | Refazer uma questão semelhante dias depois sem consultar a solução.                |
| **Performance**    | Conseguir fazer tudo isso verbalizando sob limite de tempo.                        |

## 09 — Checklist final de prioridades

Se o tempo for limitado, esta é a ordem que deve sobreviver aos cortes.

1. Array/String + Hash Map/Set + Big-O + constraints + casos de borda.

2. Two Pointers + Sliding Window + Prefix Sum + Binary Search.

3. Trees + DFS/BFS + Graph/Grid + Stack/Queue.

4. Sorting + Heap + Intervals + Greedy + Linked List.

5. Backtracking + DP fundamental + Topological Sort.

6. Monotonic Stack + Dijkstra + Union-Find + Binary Search na resposta.

7. Trie + bits + matemática + advanced DP/graphs.

8. Segment Tree / Fenwick / KMP / Rabin-Karp e demais cauda longa.

> **Não negocie esta parte:** em qualquer corte de conteúdo, mantenha a Trilha de Live Coding: clarificação, raciocínio em voz alta, brute force → otimização, dry run, teste de bordas e complexidade final.

## 10 — Referências de preparação

Fontes que sustentam a priorização geral e podem ser usadas como material complementar.

- [Tech Interview Handbook — Algorithms Study
Cheatsheet](https://www.techinterviewhandbook.org/algorithms/study-cheatsheet/)

- [Tech Interview Handbook — Grind
75](https://www.techinterviewhandbook.org/grind75/)

- [NeetCode — Practice / NeetCode
150](https://neetcode.io/practice)

- [Microsoft Careers — Technical
Interviewing](https://careers.microsoft.com/v2/global/en/hiring-tips/technical-interviewing)

- [Amazon Jobs — Software Development Interview
Topics](https://www.amazon.jobs/content/en/how-we-hire/interview-prep/software-development-topics)

- [Cracking the Coding Interview — Gayle Laakmann
McDowell](https://www.crackingthecodinginterview.com/)

- [The Algorithm Design Manual — Steven S.
Skiena](https://www.algorist.com/)

- [Programming Interviews Exposed — John Mongan et
al.](https://www.wiley.com/en-us/Programming+Interviews+Exposed%3A+Coding+Your+Way+Through+the+Interview%2C+4th+Edition-p-9781119418474)

**Nota de escopo.** Não existe uma distribuição universal e pública de frequência por tópico que represente todas as empresas. As prioridades acima são uma síntese de recorrência em listas de preparação, guias de empresas e retorno esperado de estudo, e devem ser ajustadas ao processo seletivo alvo.
