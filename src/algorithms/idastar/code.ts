export const code = {
  pseudocode: `
IDA*(grafo, inicio, objetivo, h):
  limite ← h(inicio)          # menor valor que a solução poderia ter

  repita:
      resultado, proximo ← busca(inicio, g=0, limite)

      se resultado = ENCONTRADO: devolver caminho
      se proximo = ∞:            devolver falha

      limite ← proximo          # o MENOR f que estourou o teto

busca(n, g, limite):
  f ← g + h(n)
  se f > limite: devolver (nao, f)      # poda: devolve o f que estourou
  se n = objetivo: devolver (ENCONTRADO, f)

  minimo ← ∞
  para cada sucessor s de n:             # ordem de declaração, um por vez
      r, t ← busca(s, g + custo(n,s), limite)
      se r = ENCONTRADO: devolver (ENCONTRADO, t)
      minimo ← min(minimo, t)            # guarda o menor f podado

  devolver (nao, minimo)
`,
  typescript: `
function idaStar(graph: Graph, start: NodeId, goal: NodeId, h: (n: NodeId) => number) {
  let limit = h(start);

  for (;;) {
    const result = search([start], 0, limit);

    if (result === 'found') return /* o caminho construído na recursão */;
    if (result === Infinity) return null;      // nada mais a explorar

    // Sobe exatamente até o menor f podado: nenhum valor de f é pulado,
    // e é isso que preserva a otimalidade.
    limit = result;
  }

  function search(path: NodeId[], g: number, limit: number): 'found' | number {
    const node = path[path.length - 1];
    const f = g + h(node);

    if (f > limit) return f;                   // devolve o f que estourou
    if (node === goal) return 'found';

    let min = Infinity;

    for (const edge of graph.edgesFrom(node)) {
      if (path.includes(edge.to)) continue;    // evita ciclo no caminho atual

      path.push(edge.to);
      const t = search(path, g + edge.cost, limit);
      if (t === 'found') return 'found';
      path.pop();                              // desfaz: memória é O(profundidade)

      min = Math.min(min, t);
    }

    return min;
  }
}
`,
};
