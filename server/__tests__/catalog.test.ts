import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import type { Catalog } from '../../src/domain/tree/types.ts';
import { validateCatalog } from '../../src/domain/tree/validate.ts';
import { exemploCatalog, exemploComCiclo } from '../../src/domain/tree/__fixtures__/exemplo.ts';
import { readCatalog } from '../catalog/read.ts';
import { seedCatalog, SlugRemovidoError } from '../catalog/seed.ts';
import { validateCatalogSql } from '../catalog/validateSql.ts';
import { openDatabase } from '../db.ts';
import { migrate } from '../migrations/run.ts';
import { ProgressStore } from '../progress/store.ts';
import { freshDb, nodeId } from './helpers.ts';

const nodeOf = (c: Catalog, slug: string) => c.nodes.find((n) => n.slug === slug)!;

/** Catálogo normalizado como o banco devolve: listas em ordem estável. */
function normalized(catalog: Catalog): Catalog {
  return {
    areas: [...catalog.areas].sort((a, b) => a.position - b.position),
    branches: [...catalog.branches].sort((a, b) => a.key.localeCompare(b.key)),
    nodes: [...catalog.nodes]
      .sort((a, b) => a.slug.localeCompare(b.slug))
      .map((n) => ({
        ...n,
        placements: [
          ...n.placements.filter((p) => p.branch === n.home),
          ...n.placements.filter((p) => p.branch !== n.home).sort((a, b) => a.branch.localeCompare(b.branch)),
        ],
      })),
  };
}

describe('migrate', () => {
  it('é idempotente e cria o usuário local', () => {
    const db = freshDb();
    expect(migrate(db)).toEqual({ applied: [], current: 2 });
    expect(db.prepare('SELECT id, handle FROM app_user').all()).toEqual([{ id: 1, handle: 'local' }]);
  });

  it('002 aceita exercicio_desmarcado sem perder os eventos de um banco v1', () => {
    const db = openDatabase(':memory:');
    db.exec(readFileSync(join(import.meta.dirname, '../migrations/001_skill_tree.sql'), 'utf8'));
    db.exec('CREATE TABLE schema_migrations (version INTEGER PRIMARY KEY, applied_at TEXT NOT NULL)');
    db.exec("INSERT INTO schema_migrations VALUES (1, '2026-10-09')");
    seedCatalog(db, exemploCatalog());
    new ProgressStore(db).append({ type: 'criterio_marcado', node: 'two-pointers', criterion: 'variacoes' }, '2026-10-09T10:00:00.000Z');
    expect(() =>
      db.exec("INSERT INTO progress_event (user_id, node_id, type) VALUES (1, 1, 'exercicio_desmarcado')"),
    ).toThrow(/CHECK/);

    expect(migrate(db)).toEqual({ applied: [2], current: 2 });
    expect(new ProgressStore(db).exportLog().events).toEqual([
      { type: 'criterio_marcado', node: 'two-pointers', criterion: 'variacoes', occurredAt: '2026-10-09T10:00:00.000Z' },
    ]);
    expect(db.prepare("SELECT xp FROM v_area_xp WHERE slug = 'fund'").get()).toEqual({ xp: 10 });
    new ProgressStore(db).append({ type: 'exercicio_resolvido', node: 'two-pointers', exercise: 'two-sum-ii' });
    expect(new ProgressStore(db).append({ type: 'exercicio_desmarcado', node: 'two-pointers', exercise: 'two-sum-ii' })).toBe(true);
  });
});

describe('seedCatalog', () => {
  it('ida e volta: o que entra é o que readCatalog devolve', () => {
    const db = freshDb(exemploCatalog());
    expect(readCatalog(db)).toEqual(normalized(exemploCatalog()));
  });

  it('é idempotente: semear de novo não muda ids nem contagens', () => {
    const db = freshDb(exemploCatalog());
    const snapshot = () => ({
      nodes: db.prepare('SELECT id, slug FROM node ORDER BY id').all(),
      criteria: db.prepare('SELECT id, slug FROM node_criterion ORDER BY id').all(),
      requirements: db.prepare('SELECT COUNT(*) AS n FROM requirement').get(),
      placements: db.prepare('SELECT COUNT(*) AS n FROM node_placement').get(),
    });
    const before = snapshot();
    seedCatalog(db, exemploCatalog());
    expect(snapshot()).toEqual(before);
  });

  it('o progresso sobrevive a uma nova semeadura com conteúdo editado', () => {
    const db = freshDb(exemploCatalog());
    const store = new ProgressStore(db);
    store.append({ type: 'criterio_marcado', node: 'two-pointers', criterion: 'variacoes' });

    const edited = exemploCatalog();
    nodeOf(edited, 'two-pointers').title = 'Dois ponteiros';
    nodeOf(edited, 'two-pointers').criteria[0].text = 'Texto novo';
    seedCatalog(db, edited);

    expect(db.prepare('SELECT COUNT(*) AS n FROM user_criterion').get()).toEqual({ n: 1 });
    expect(readCatalog(db).nodes.find((n) => n.slug === 'two-pointers')?.title).toBe('Dois ponteiros');
  });

  it('remove nó que saiu do conteúdo quando não tem progresso', () => {
    const db = freshDb(exemploCatalog());
    const edited = exemploCatalog();
    edited.nodes = edited.nodes.filter((n) => n.slug !== 'consistent-hashing');
    expect(seedCatalog(db, edited).removed).toEqual(['consistent-hashing']);
    expect(db.prepare("SELECT 1 FROM node WHERE slug = 'consistent-hashing'").get()).toBeUndefined();
  });

  it('recusa remover nó com progresso (slugs são permanentes)', () => {
    const db = freshDb(exemploCatalog());
    new ProgressStore(db).append({ type: 'iniciou', node: 'consistent-hashing' });
    const edited = exemploCatalog();
    edited.nodes = edited.nodes.filter((n) => n.slug !== 'consistent-hashing');
    expect(() => seedCatalog(db, edited)).toThrow(SlugRemovidoError);
    // A transação inteira volta: o nó continua lá.
    expect(nodeId(db, 'consistent-hashing')).toBeGreaterThan(0);
  });

  it('remove branch e área que saíram do conteúdo', () => {
    const db = freshDb(exemploCatalog());
    const edited = exemploCatalog();
    edited.nodes = edited.nodes.filter((n) => n.slug !== 'consistent-hashing');
    nodeOf(edited, 'hashing').placements = nodeOf(edited, 'hashing').placements.filter((p) => p.branch !== 'es/sd');
    edited.branches = edited.branches.filter((b) => b.key !== 'es/sd');
    edited.areas = edited.areas.filter((a) => a.slug !== 'es');
    seedCatalog(db, edited);
    expect(readCatalog(db)).toEqual(normalized(edited));
  });
});

describe('validate.sql × validateCatalog', () => {
  const sqlCodes = (catalog: Catalog) => validateCatalogSql(freshDb(catalog)).map((e) => e.code);
  const tsCodes = (catalog: Catalog) => validateCatalog(catalog).map((e) => e.code);

  it('o exemplo passa nos dois', () => {
    expect(sqlCodes(exemploCatalog())).toEqual([]);
    expect(tsCodes(exemploCatalog())).toEqual([]);
  });

  const broken: [string, (c: Catalog) => Catalog][] = [
    ['ciclo', () => exemploComCiclo()],
    [
      'sem_placement_na_casa',
      (c) => {
        nodeOf(c, 'arrays').placements = [{ branch: 'fund/padroes', role: 'lateral', x: 0.1, y: 0.1 }];
        return c;
      },
    ],
    [
      'grupo_ou_unitario',
      (c) => {
        nodeOf(c, 'two-pointers').requires = nodeOf(c, 'two-pointers').requires.filter((r) => r.node !== 'hashing');
        return c;
      },
    ],
    [
      'min_level_impossivel',
      (c) => {
        nodeOf(c, 'arrays').requires.push({ node: 'indice-hash', minLevel: 3, strength: 'recomendado' });
        return c;
      },
    ],
  ];

  it.each(broken)('os dois acusam %s', (code, make) => {
    expect(sqlCodes(make(exemploCatalog()))).toContain(code);
    expect(tsCodes(make(exemploCatalog()))).toContain(code);
  });
});
