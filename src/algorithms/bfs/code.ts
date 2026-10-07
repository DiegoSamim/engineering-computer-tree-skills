export const code = {
  pseudocode: `
BFS(grafo, inicio, objetivo):
  fila     ← [inicio]              # FIFO
  descobertos ← {inicio}           # evita reprocessar o mesmo nó

  enquanto fila não vazia:
      n ← fila.remover_do_início()

      para cada sucessor s de n:
          se s ∈ descobertos: continue

          descobertos.adicionar(s)

          # Teste de objetivo na GERAÇÃO, não na expansão:
          # é o que faz a BFS parar um nível antes.
          se s = objetivo:
              devolver caminho(inicio → s)

          fila.adicionar_ao_final(s)

  devolver falha
`,
  typescript: `
function bfs(graph: Graph, start: NodeId, goal: NodeId): NodeId[] | null {
  const queue: Path[] = [[start]];
  const discovered = new Set<NodeId>([start]);

  while (queue.length > 0) {
    const path = queue.shift()!;          // FIFO: o primeiro que entrou
    const node = path[path.length - 1];

    for (const next of graph.successors(node)) {
      if (discovered.has(next)) continue;
      discovered.add(next);

      // Testar aqui (na geração) e não ao desenfileirar economiza
      // um nível inteiro de expansões.
      if (next === goal) return [...path, next];

      queue.push([...path, next]);
    }
  }

  return null;
}
`,
};
