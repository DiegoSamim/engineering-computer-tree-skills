export const code = {
  pseudocode: `
DFS(grafo, inicio, objetivo):
  pilha    ← [inicio]              # LIFO
  descobertos ← {inicio}

  enquanto pilha não vazia:
      n ← pilha.remover_do_topo()

      se n = objetivo:             # teste na EXPANSÃO
          devolver caminho(inicio → n)

      sucessores ← grafo.sucessores(n)

      # Empilhar na ordem INVERSA faz o primeiro sucessor
      # declarado ficar no topo — a mesma ordem de uma DFS recursiva.
      para cada s em reverso(sucessores):
          se s ∉ descobertos:
              descobertos.adicionar(s)
              pilha.empilhar(s)

  devolver falha
`,
  typescript: `
function dfs(graph: Graph, start: NodeId, goal: NodeId): NodeId[] | null {
  const stack: Path[] = [[start]];
  const discovered = new Set<NodeId>([start]);

  while (stack.length > 0) {
    const path = stack.pop()!;            // LIFO: o último que entrou
    const node = path[path.length - 1];

    if (node === goal) return path;

    // Invertido de propósito: sem isso, o ÚLTIMO sucessor seria
    // explorado primeiro, e a ordem não bateria com a recursiva.
    const successors = [...graph.successors(node)].reverse();

    for (const next of successors) {
      if (discovered.has(next)) continue;
      discovered.add(next);
      stack.push([...path, next]);
    }
  }

  return null;
}
`,
};
