import { describe, expect, it } from 'vitest';
import type { Catalog } from '../types.ts';
import { validateCatalog, type CatalogErrorCode } from '../validate.ts';
import { exemploCatalog, exemploComCiclo } from '../__fixtures__/exemplo.ts';

const codes = (catalog: Catalog): CatalogErrorCode[] => validateCatalog(catalog).map((e) => e.code);

/** Aplica uma alteração no exemplo e devolve os códigos de erro. */
function codesAfter(change: (catalog: Catalog) => void): CatalogErrorCode[] {
  const catalog = exemploCatalog();
  change(catalog);
  return codes(catalog);
}
const nodeOf = (catalog: Catalog, slug: string) => catalog.nodes.find((n) => n.slug === slug)!;

describe('validateCatalog', () => {
  it('o exemplo é válido', () => {
    expect(validateCatalog(exemploCatalog())).toEqual([]);
  });

  it('acusa ciclo', () => {
    // Arrays -> Sliding Window -> Two Pointers -> Arrays (e, via Hashing, um segundo ciclo).
    const errors = validateCatalog(exemploComCiclo());
    expect(errors.length).toBeGreaterThan(0);
    expect(errors.every((e) => e.code === 'ciclo')).toBe(true);
    expect(errors[0].message).toBe('Ciclo de requisitos: arrays -> sliding-window -> two-pointers -> arrays');
  });

  it('acusa ciclo que passa por requisito de branch inteira', () => {
    // Big-O exige a branch Padrões, cujo tronco (Two Pointers) exige Arrays...
    // e Arrays passa a exigir Big-O.
    expect(
      codesAfter((c) => {
        nodeOf(c, 'big-o').requires.push({ branch: 'fund/padroes', minLevel: 1, strength: 'obrigatorio' });
        nodeOf(c, 'arrays').requires.push({ node: 'big-o', minLevel: 1, strength: 'obrigatorio' });
      }),
    ).toContain('ciclo');
  });

  it.each<[string, (c: Catalog) => void, CatalogErrorCode]>([
    ['nó sem placement na casa', (c) => (nodeOf(c, 'arrays').placements = [{ branch: 'fund/padroes', role: 'tronco', x: 0.1, y: 0.1 }]), 'sem_placement_na_casa'],
    ['grupo OU com um requisito só', (c) => (nodeOf(c, 'two-pointers').requires = nodeOf(c, 'two-pointers').requires.filter((r) => r.node !== 'hashing')), 'grupo_ou_unitario'],
    ['nível mínimo acima do máximo do alvo', (c) => nodeOf(c, 'arrays').requires.push({ node: 'indice-hash', minLevel: 3, strength: 'recomendado' }), 'min_level_impossivel'],
    ['slug duplicado', (c) => c.nodes.push({ ...nodeOf(c, 'arrays') }), 'slug_duplicado'],
    ['casa inexistente', (c) => (nodeOf(c, 'arrays').home = 'fund/nao-existe'), 'branch_inexistente'],
    ['alvo inexistente', (c) => nodeOf(c, 'arrays').requires.push({ node: 'fantasma', minLevel: 1, strength: 'obrigatorio' }), 'alvo_inexistente'],
    ['requisito duplicado', (c) => nodeOf(c, 'hashing').requires.push({ node: 'arrays', minLevel: 2, strength: 'obrigatorio' }), 'requisito_duplicado'],
    ['nó exige a si mesmo', (c) => nodeOf(c, 'arrays').requires.push({ node: 'arrays', minLevel: 1, strength: 'obrigatorio' }), 'requisito_proprio'],
    ['coordenada fora de 0–1', (c) => (nodeOf(c, 'arrays').placements[0].x = 1.2), 'coordenada_invalida'],
    ['placement repetido na mesma branch', (c) => nodeOf(c, 'arrays').placements.push({ branch: 'fund/estruturas', role: 'lateral', x: 0.1, y: 0.1 }), 'placement_duplicado'],
    ['critério repetido', (c) => nodeOf(c, 'two-pointers').criteria.push({ id: 'medios', level: 2, label: 'x', text: 'y' }), 'criterio_duplicado'],
    ['nível sem critério', (c) => (nodeOf(c, 'two-pointers').criteria = nodeOf(c, 'two-pointers').criteria.filter((k) => k.level !== 2)), 'nivel_sem_criterio'],
    ['critério acima do máximo', (c) => nodeOf(c, 'two-pointers').criteria.push({ id: 'extra', level: 4, label: 'x', text: 'y' }), 'criterio_nivel_invalido'],
    ['publicado sem critérios', (c) => (nodeOf(c, 'arrays').content = 'publicado'), 'publicado_sem_criterios'],
    [
      'requisito de branch sem tronco',
      (c) => {
        c.branches.push({ key: 'fund/discreta', area: 'fund', slug: 'discreta', name: 'Matemática discreta', position: 6 });
        nodeOf(c, 'arrays').requires.push({ branch: 'fund/discreta', minLevel: 1, strength: 'recomendado' });
      },
      'branch_sem_tronco',
    ],
    ['relação para nó inexistente', (c) => nodeOf(c, 'arrays').related.push({ node: 'fantasma', type: 'ver_tambem' }), 'relacao_invalida'],
    ['max_level fora de 1–5', (c) => (nodeOf(c, 'arrays').maxLevel = 6), 'max_level_invalido'],
    ['área inexistente', (c) => c.branches.push({ key: 'x/y', area: 'x', slug: 'y', name: 'Y', position: 1 }), 'area_inexistente'],
    ['ícone desconhecido', (c) => (c.areas[0].icon = 'foguete' as never), 'icone_invalido'],
  ])('acusa %s', (_name, change, code) => {
    expect(codesAfter(change)).toContain(code);
  });
});
