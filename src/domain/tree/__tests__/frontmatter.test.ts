import { describe, expect, it } from 'vitest';
import { parseArea, parseBranch, parseNode } from '../frontmatter.ts';

describe('parseArea', () => {
  it('lê uma área válida', () => {
    const parsed = parseArea(
      { slug: 'fund', name: 'Fundamentos', sub: 'Bases teóricas', color: '#f5c46b', icon: 'capelo', position: 1 },
      'content/fund/_area.yaml',
    );
    expect(parsed).toEqual({
      value: { slug: 'fund', name: 'Fundamentos', sub: 'Bases teóricas', description: undefined, color: '#f5c46b', icon: 'capelo', position: 1 },
      errors: [],
    });
  });

  it('aponta arquivo e campo de cada erro', () => {
    const parsed = parseArea({ slug: 'fund', color: 'amarelo', icon: 'foguete' }, 'a.yaml');
    expect(parsed.value).toBeNull();
    expect(parsed.errors.map((e) => `${e.file}:${e.field}`)).toEqual(['a.yaml:color', 'a.yaml:name', 'a.yaml:icon', 'a.yaml:position']);
  });
});

describe('parseBranch', () => {
  it('monta a chave area/branch', () => {
    const parsed = parseBranch({ slug: 'padroes', name: 'Padrões de resolução', position: 4 }, 'fund', 'b.yaml');
    expect(parsed.value?.key).toBe('fund/padroes');
  });
});

describe('parseNode', () => {
  const raw = {
    slug: 'two-pointers',
    title: 'Two Pointers',
    home: 'fund/padroes',
    kind: 'padrao',
    content: 'publicado',
    max_level: 3,
    est_minutes: 45,
    summary: 'Dois índices.',
    place: { role: 'tronco', x: 0.5, y: 0.7 },
    mirrors: [{ branch: 'dados/indexacao', role: 'lateral', x: 0.3, y: 0.8 }],
    requires: [{ node: 'arrays' }, { node: 'ordenacao', group: 1 }, { node: 'hashing', group: 1, min_level: 2 }, { branch: 'fund/complexidade', strength: 'recomendado' }],
    related: [{ node: 'sliding-window', type: 'compara_com' }],
    levels: [
      { level: 1, name: 'Entendi', criteria: [{ id: 'reconhecimento', label: 'Reconhecimento', text: 'Ver o padrão.' }] },
      { level: 2, criteria: [{ id: 'implementacao', label: 'Implementação', text: 'Escrever.' }] },
    ],
    exercises: [{ id: 'two-sum-ii', title: 'Two Sum II', url: 'https://x', difficulty: 'facil' }],
    visualizer: 'two-pointers',
  };

  it('normaliza o formato do CLAUDE.md', () => {
    const { value, errors } = parseNode(raw, 'n.yaml');
    expect(errors).toEqual([]);
    expect(value?.placements).toEqual([
      { branch: 'fund/padroes', role: 'tronco', x: 0.5, y: 0.7 },
      { branch: 'dados/indexacao', role: 'lateral', x: 0.3, y: 0.8 },
    ]);
    expect(value?.requires).toEqual([
      { node: 'arrays', minLevel: 1, strength: 'obrigatorio' },
      { node: 'ordenacao', minLevel: 1, strength: 'obrigatorio', group: 1 },
      { node: 'hashing', minLevel: 2, strength: 'obrigatorio', group: 1 },
      { branch: 'fund/complexidade', minLevel: 1, strength: 'recomendado' },
    ]);
    expect(value?.criteria).toEqual([
      { id: 'reconhecimento', level: 1, label: 'Reconhecimento', text: 'Ver o padrão.' },
      { id: 'implementacao', level: 2, label: 'Implementação', text: 'Escrever.' },
    ]);
    expect(value).toMatchObject({ maxLevel: 3, estMinutes: 45, summary: 'Dois índices.', visualizer: 'two-pointers' });
  });

  it('usa os padrões: conteúdo planejado e max_level 3', () => {
    const { value } = parseNode({ slug: 'x', title: 'X', home: 'fund/padroes', kind: 'conceito', place: { role: 'lateral', x: 0, y: 1 } }, 'x.yaml');
    expect(value).toMatchObject({ content: 'planejado', maxLevel: 3, requires: [], criteria: [] });
  });

  it('recusa valores fora do vocabulário', () => {
    const { errors } = parseNode({ ...raw, kind: 'tutorial', requires: [{ node: 'a', strength: 'talvez' }] }, 'n.yaml');
    expect(errors.map((e) => e.field)).toEqual(['requires[0].strength', 'kind']);
  });

  it('exige place na casa', () => {
    const { errors } = parseNode({ ...raw, place: undefined }, 'n.yaml');
    expect(errors.map((e) => e.field)).toContain('place');
  });
});
