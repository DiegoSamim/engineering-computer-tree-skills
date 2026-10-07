export const code = {
  pseudocode: `
A*(grafo, inicio, objetivo, h):
  fronteira ← fila_de_prioridade ordenada por f(n) = g(n) + h(n)
  fronteira.inserir(inicio, g=0, f=h(inicio))
  melhor_g ← { inicio: 0 }

  enquanto fronteira não vazia:
      n ← fronteira.remover_menor_f()

      # Teste na EXPANSAO, nunca na geração: e o que da tempo de um
      # caminho mais barato aparecer antes de fechar a resposta.
      se n = objetivo:
          devolver caminho(inicio → n)

      para cada sucessor s de n:
          g_novo ← g(n) + custo(n, s)

          se s desconhecido ou g_novo < melhor_g[s]:
              melhor_g[s] ← g_novo
              f ← g_novo + h(s)
              fronteira.inserir_ou_atualizar(s, g_novo, f)

  devolver falha
`,
  typescript: `
function aStar(graph: Graph, start: NodeId, goal: NodeId, h: (n: NodeId) => number) {
  // Ordenada por f = g + h; empate resolvido por ordem de descoberta.
  const frontier = new PriorityQueue<Entry>((e) => e.g + h(e.node));
  frontier.push({ node: start, g: 0, path: [start] });

  const bestG = new Map<NodeId, number>([[start, 0]]);

  while (!frontier.isEmpty()) {
    const current = frontier.pop()!;

    if (current.node === goal) return current.path;   // teste na expansão

    for (const edge of graph.edgesFrom(current.node)) {
      const g = current.g + edge.cost;
      const known = bestG.get(edge.to);

      // Só vale a pena guardar se for um caminho estritamente mais barato.
      if (known !== undefined && g >= known) continue;

      bestG.set(edge.to, g);
      frontier.upsert({ node: edge.to, g, path: [...current.path, edge.to] });
    }
  }

  return null;
}
`,
};
