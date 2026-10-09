import type { Catalog, NodeDef } from '../types.ts';

/**
 * `docs/db/seed_exemplo.sql` com os slugs do catálogo (`fund`, `dados`, `es`).
 * Exercita espelho, requisito OU, requisito de branch inteira, requisito entre
 * áreas e nível mínimo. Usado pelos testes do domínio e pelos testes SQL.
 */

function node(partial: Partial<NodeDef> & Pick<NodeDef, 'slug' | 'title' | 'home' | 'kind' | 'content' | 'placements'>): NodeDef {
  return { maxLevel: 3, requires: [], related: [], criteria: [], exercises: [], ...partial };
}

export function exemploCatalog(): Catalog {
  return {
    areas: [
      { slug: 'fund', name: 'Fundamentos', color: '#f5c46b', icon: 'capelo', position: 1 },
      { slug: 'dados', name: 'Dados', color: '#ff9e6b', icon: 'cilindro', position: 4 },
      { slug: 'es', name: 'Engenharia de Software', color: '#8ea2ff', icon: 'blocos', position: 10 },
    ],
    branches: [
      { key: 'fund/complexidade', area: 'fund', slug: 'complexidade', name: 'Complexidade e análise', position: 2 },
      { key: 'fund/estruturas', area: 'fund', slug: 'estruturas', name: 'Estruturas de dados', position: 3 },
      { key: 'fund/padroes', area: 'fund', slug: 'padroes', name: 'Padrões de resolução', position: 4 },
      { key: 'dados/indexacao', area: 'dados', slug: 'indexacao', name: 'Indexação e otimização', position: 3 },
      { key: 'es/sd', area: 'es', slug: 'sd', name: 'System Design', position: 3 },
    ],
    nodes: [
      node({
        slug: 'big-o',
        title: 'Big-O',
        home: 'fund/complexidade',
        kind: 'conceito',
        content: 'rascunho',
        placements: [{ branch: 'fund/complexidade', role: 'tronco', x: 0.5, y: 0.2 }],
      }),
      node({
        slug: 'arrays',
        title: 'Arrays',
        home: 'fund/estruturas',
        kind: 'conceito',
        content: 'rascunho',
        placements: [{ branch: 'fund/estruturas', role: 'tronco', x: 0.5, y: 0.2 }],
      }),
      node({
        slug: 'hashing',
        title: 'Hash Map / Hash Set',
        home: 'fund/estruturas',
        kind: 'conceito',
        content: 'rascunho',
        placements: [
          { branch: 'fund/estruturas', role: 'tronco', x: 0.5, y: 0.5 },
          { branch: 'dados/indexacao', role: 'tronco', x: 0.3, y: 0.2 },
          { branch: 'es/sd', role: 'tronco', x: 0.2, y: 0.2 },
        ],
        requires: [{ node: 'arrays', minLevel: 1, strength: 'obrigatorio' }],
        related: [{ node: 'indice-hash', type: 'aplica_em' }],
      }),
      node({
        slug: 'ordenacao',
        title: 'Ordenação',
        home: 'fund/padroes',
        kind: 'padrao',
        content: 'planejado',
        placements: [{ branch: 'fund/padroes', role: 'lateral', x: 0.2, y: 0.3 }],
      }),
      node({
        slug: 'two-pointers',
        title: 'Two Pointers',
        home: 'fund/padroes',
        kind: 'padrao',
        content: 'publicado',
        placements: [{ branch: 'fund/padroes', role: 'tronco', x: 0.5, y: 0.3 }],
        requires: [
          { node: 'arrays', minLevel: 1, strength: 'obrigatorio' },
          { node: 'ordenacao', minLevel: 1, strength: 'obrigatorio', group: 1 },
          { node: 'hashing', minLevel: 1, strength: 'obrigatorio', group: 1 },
          { branch: 'fund/complexidade', minLevel: 1, strength: 'recomendado' },
        ],
        related: [{ node: 'sliding-window', type: 'compara_com' }],
        criteria: [
          { id: 'variacoes', level: 1, label: 'Variações', text: 'Explicar as variações sem consultar' },
          { id: 'medios', level: 2, label: 'Prática', text: 'Resolver 3 exercícios médios' },
          { id: 'retencao', level: 3, label: 'Retenção', text: 'Refazer um exercício 7 dias depois' },
        ],
        exercises: [{ id: 'two-sum-ii', title: 'Two Sum II', url: 'https://leetcode.com/problems/two-sum-ii-input-array-is-sorted/', difficulty: 'facil' }],
      }),
      node({
        slug: 'sliding-window',
        title: 'Sliding Window',
        home: 'fund/padroes',
        kind: 'padrao',
        content: 'planejado',
        placements: [{ branch: 'fund/padroes', role: 'tronco', x: 0.6, y: 0.6 }],
        requires: [{ node: 'two-pointers', minLevel: 2, strength: 'obrigatorio' }],
      }),
      node({
        slug: 'indice-hash',
        title: 'Índice hash',
        home: 'dados/indexacao',
        kind: 'conceito',
        content: 'planejado',
        maxLevel: 2,
        placements: [{ branch: 'dados/indexacao', role: 'tronco', x: 0.5, y: 0.5 }],
        requires: [{ node: 'hashing', minLevel: 2, strength: 'obrigatorio' }],
      }),
      node({
        slug: 'consistent-hashing',
        title: 'Consistent hashing',
        home: 'es/sd',
        kind: 'conceito',
        content: 'planejado',
        maxLevel: 2,
        placements: [{ branch: 'es/sd', role: 'tronco', x: 0.5, y: 0.5 }],
        requires: [{ node: 'hashing', minLevel: 1, strength: 'obrigatorio' }],
      }),
    ],
  };
}

/** Variante: Sliding Window passa a exigir a branch Complexidade inteira. */
export function exemploComRequisitoDeBranch(): Catalog {
  const catalog = exemploCatalog();
  catalog.nodes.find((n) => n.slug === 'sliding-window')!.requires.push({
    branch: 'fund/complexidade',
    minLevel: 1,
    strength: 'obrigatorio',
  });
  return catalog;
}

/** Variante: Arrays exige Sliding Window, fechando um ciclo. */
export function exemploComCiclo(): Catalog {
  const catalog = exemploCatalog();
  catalog.nodes.find((n) => n.slug === 'arrays')!.requires.push({
    node: 'sliding-window',
    minLevel: 1,
    strength: 'obrigatorio',
  });
  return catalog;
}
