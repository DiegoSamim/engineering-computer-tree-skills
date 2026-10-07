export interface Concept {
  term: string;
  definition: string;
}

/**
 * The contextual glossary — "Entenda este conceito". Every narration step
 * can point at one of these keys; the panel just looks it up. Add a new
 * term here and any algorithm's narration can reference it immediately.
 */
export const CONCEPTS: Record<string, Concept> = {
  no: {
    term: 'Nó',
    definition: 'Um estado do problema, representado como um ponto no grafo. Cada nó é uma situação possível — por exemplo, uma cidade em um mapa de rotas.',
  },
  aresta: {
    term: 'Aresta',
    definition: 'Uma conexão entre dois nós, representando uma ação possível que leva de um estado a outro. Pode ter um custo associado.',
  },
  estado: {
    term: 'Estado',
    definition: 'Uma configuração específica do problema em um dado momento. No grafo, cada nó representa um estado.',
  },
  'estado-inicial': {
    term: 'Estado inicial',
    definition: 'O nó de onde a busca começa. É o ponto de partida — no grafo principal deste app, é o nó S.',
  },
  objetivo: {
    term: 'Objetivo',
    definition: 'O nó (ou um dos nós) que a busca está tentando alcançar. Quando encontrado, a busca pode parar.',
  },
  sucessor: {
    term: 'Sucessor',
    definition: 'Um nó alcançável diretamente a partir do nó atual, por uma única aresta. "Gerar os sucessores" é descobrir para onde se pode ir a seguir.',
  },
  expandir: {
    term: 'Expandir',
    definition: 'Examinar um nó e gerar todos os seus sucessores. Um nó "expandido" já teve seus vizinhos descobertos.',
  },
  profundidade: {
    term: 'Profundidade',
    definition: 'O número de arestas percorridas desde o estado inicial até um nó. O estado inicial tem profundidade 0.',
  },
  'custo-aresta': {
    term: 'Custo da aresta',
    definition: 'O "preço" de percorrer uma aresta específica — por exemplo, a distância ou o tempo de uma rota entre duas cidades.',
  },
  'custo-acumulado': {
    term: 'Custo acumulado — g(n)',
    definition: 'A soma dos custos de todas as arestas percorridas desde o estado inicial até o nó n. Também chamado de g(n).',
  },
  fronteira: {
    term: 'Fronteira',
    definition: 'O conjunto de nós que já foram descobertos, mas ainda não foram completamente explorados (expandidos). É "a fila de espera" da busca.',
  },
  visitados: {
    term: 'Nós visitados / descobertos',
    definition: 'Nós que a busca já encontrou em algum momento — seja porque já foram expandidos, seja porque ainda esperam na fronteira.',
  },
  expandidos: {
    term: 'Nós expandidos',
    definition: 'Nós que já tiveram seus sucessores gerados e examinados. Expandir um nó é diferente de apenas descobri-lo.',
  },
  'caminho-atual': {
    term: 'Caminho atual',
    definition: 'A sequência de nós do estado inicial até o nó que está sendo explorado agora. Em buscas com backtracking, esse caminho pode encolher quando um ramo é abandonado.',
  },
  'caminho-solucao': {
    term: 'Caminho solução',
    definition: 'O caminho final, do estado inicial até o objetivo, que a busca devolve como resposta.',
  },
  fila: {
    term: 'Fila (FIFO)',
    definition: 'First In, First Out — o primeiro elemento a entrar é o primeiro a sair. É a estrutura de dados usada pela Busca em Largura.',
  },
  pilha: {
    term: 'Pilha (LIFO)',
    definition: 'Last In, First Out — o último elemento a entrar é o primeiro a sair. É a estrutura de dados usada pela Busca em Profundidade.',
  },
  heuristica: {
    term: 'Heurística — h(n)',
    definition: 'Uma estimativa de quão longe um nó está do objetivo. Não é o custo real — é um "palpite" calculado, usado para guiar a busca mais rapidamente até a solução.',
  },
  'funcao-avaliacao': {
    term: 'Função de avaliação — f(n)',
    definition: 'A função que uma busca usa para decidir qual nó explorar a seguir. No A*, f(n) = g(n) + h(n): custo já gasto mais estimativa do que falta.',
  },
  backtracking: {
    term: 'Backtracking',
    definition: 'Desfazer a última decisão tomada e tentar uma alternativa diferente, ao perceber que o caminho atual não leva a lugar nenhum.',
  },
  poda: {
    term: 'Poda',
    definition: 'Descartar um ramo da busca sem explorá-lo completamente, por já se saber (ou suspeitar fortemente) que ele não leva a uma solução melhor.',
  },
  completude: {
    term: 'Completude',
    definition: 'Uma busca é completa quando garante encontrar uma solução, se ela existir. Nem todo algoritmo tem essa garantia.',
  },
  otimalidade: {
    term: 'Otimalidade',
    definition: 'Uma busca é ótima quando garante encontrar a solução de menor custo — não apenas alguma solução, mas a melhor entre todas as possíveis.',
  },
};

export function getConcept(id?: string): Concept | undefined {
  if (!id) return undefined;
  return CONCEPTS[id];
}
