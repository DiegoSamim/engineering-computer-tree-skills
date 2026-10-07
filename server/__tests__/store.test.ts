import { beforeEach, describe, expect, it } from 'vitest';
import { openDatabase, type Db } from '../db.ts';
import { migrate } from '../migrations/run.ts';
import { seedCatalog } from '../seed.ts';
import { SqliteProgressStore, UnknownTopicError } from '../store.ts';
import { applyProgressEvent } from '../../src/data/reducer.ts';
import { createEmptySnapshot, type ProgressEvent } from '../../src/data/types.ts';

function freshStore(): { db: Db; store: SqliteProgressStore } {
  const db = openDatabase(':memory:');
  migrate(db);
  seedCatalog(db);
  return { db, store: new SqliteProgressStore(db) };
}

/** Instantes fixos para que `updatedAt` seja comparável entre os dois caminhos. */
const TIMES = [
  '2026-01-01T10:00:00.000Z',
  '2026-01-01T10:01:00.000Z',
  '2026-01-01T10:02:00.000Z',
  '2026-01-01T10:03:00.000Z',
  '2026-01-01T10:04:00.000Z',
  '2026-01-01T10:05:00.000Z',
];

const EVENTS: ProgressEvent[] = [
  { type: 'PROFILE_SET', displayName: 'Diego' },
  { type: 'TOPIC_SECTION_COMPLETED', topicId: 'two-pointers', sectionKey: 'visao-geral' },
  { type: 'MASTERY_TOGGLED', topicId: 'two-pointers', dimension: 'reconhecimento', value: true },
  { type: 'EXERCISE_MARKED', topicId: 'two-pointers', exerciseId: 'two-sum-ii', done: true },
  { type: 'STUDY_SESSION_ENDED', topicId: 'two-pointers', seconds: 420 },
  { type: 'TOPIC_STATUS_CHANGED', topicId: 'sliding-window', status: 'em-estudo' },
];

describe('SqliteProgressStore', () => {
  let db: Db;
  let store: SqliteProgressStore;

  beforeEach(() => {
    ({ db, store } = freshStore());
  });

  it('parte de um snapshot vazio', () => {
    const snapshot = store.load();
    expect(snapshot.profile).toBeNull();
    expect(snapshot.topics).toEqual({});
    expect(store.eventCount()).toBe(0);
  });

  it('produz EXATAMENTE o mesmo snapshot que o fold puro do reducer', () => {
    // Esta é a garantia central: cliente e servidor aplicam as mesmas regras.
    // Se divergirem algum dia, é aqui que aparece.
    let expected = createEmptySnapshot(TIMES[0]);
    EVENTS.forEach((event, i) => {
      expected = applyProgressEvent(expected, event, TIMES[i]);
      store.append(event, TIMES[i]);
    });

    expect(store.load()).toEqual(expected);
  });

  it('grava cada fato no log append-only, na ordem', () => {
    EVENTS.forEach((event, i) => store.append(event, TIMES[i]));

    expect(store.eventCount()).toBe(EVENTS.length);
    const types = (db.prepare('SELECT type FROM progress_event ORDER BY id').all() as { type: string }[]).map(
      (r) => r.type,
    );
    expect(types).toEqual(EVENTS.map((e) => e.type));
  });

  it('materializa o estado derivado nas tabelas, não só no log', () => {
    EVENTS.forEach((event, i) => store.append(event, TIMES[i]));

    const progress = db.prepare("SELECT status, seconds_studied FROM topic_progress WHERE topic_id = 'two-pointers'").get();
    expect(progress).toEqual({ status: 'em-estudo', seconds_studied: 420 });

    const mastery = db.prepare("SELECT checked FROM mastery_check WHERE topic_id='two-pointers' AND dimension='reconhecimento'").get();
    expect(mastery).toEqual({ checked: 1 });

    const exercises = db.prepare("SELECT exercise_id FROM exercise_progress WHERE topic_id='two-pointers'").all();
    expect(exercises).toEqual([{ exercise_id: 'two-sum-ii' }]);
  });

  it('rebuild() a partir do log reproduz o mesmo estado', () => {
    EVENTS.forEach((event, i) => store.append(event, TIMES[i]));
    const before = store.load();

    // Corrompe o estado derivado de propósito: o log é que é a fonte da verdade.
    db.exec("UPDATE topic_progress SET seconds_studied = 99999 WHERE topic_id = 'two-pointers'");
    expect(store.load().topics['two-pointers'].secondsStudied).toBe(99999);

    store.rebuild();
    expect(store.load()).toEqual(before);
  });

  it('rejeita tópico fora do catálogo sem sujar o log', () => {
    expect(() => store.append({ type: 'TOPIC_SECTION_COMPLETED', topicId: 'nao-existe', sectionKey: 'x' })).toThrow(
      UnknownTopicError,
    );
    expect(store.eventCount()).toBe(0);
  });

  it('desfaz a transação inteira quando a escrita derivada falha', () => {
    store.append(EVENTS[0], TIMES[0]);
    const countBefore = store.eventCount();

    // FK inválida na tabela derivada: o evento não pode sobrar no log.
    db.exec('PRAGMA foreign_keys = ON');
    expect(() =>
      store.append({ type: 'MASTERY_TOGGLED', topicId: 'inexistente', dimension: 'modelagem', value: true }),
    ).toThrow();
    expect(store.eventCount()).toBe(countBefore);
  });

  it('export/import preserva os instantes originais de cada evento', () => {
    EVENTS.forEach((event, i) => store.append(event, TIMES[i]));
    const exported = store.exportLog();
    expect(exported.events.map((e) => e.occurredAt)).toEqual(TIMES);

    const { store: other } = freshStore();
    const result = other.importLog(exported);

    expect(result.imported).toBe(EVENTS.length);
    expect(result.skipped).toBe(0);
    expect(other.exportLog().events.map((e) => e.occurredAt)).toEqual(TIMES);
    expect(other.load()).toEqual(store.load());
  });

  it('importa pulando eventos de tópicos que saíram do catálogo', () => {
    const result = store.importLog({
      schemaVersion: 1,
      events: [
        { type: 'PROFILE_SET', displayName: 'Diego', occurredAt: TIMES[0] },
        { type: 'MASTERY_TOGGLED', topicId: 'topico-extinto', dimension: 'modelagem', value: true, occurredAt: TIMES[1] },
        { type: 'TOPIC_SECTION_COMPLETED', topicId: 'two-pointers', sectionKey: 'intuicao', occurredAt: TIMES[2] },
      ],
    });

    expect(result.imported).toBe(2);
    expect(result.skipped).toBe(1);
    expect(result.snapshot.profile?.displayName).toBe('Diego');
    expect(result.snapshot.topics['two-pointers'].sectionsDone).toEqual(['intuicao']);
  });

  it('reset() zera log e estado derivado', () => {
    EVENTS.forEach((event, i) => store.append(event, TIMES[i]));
    store.reset();

    expect(store.eventCount()).toBe(0);
    expect(store.load().profile).toBeNull();
    expect(store.load().topics).toEqual({});
  });
});

describe('migrate', () => {
  it('é idempotente', () => {
    const db = openDatabase(':memory:');
    expect(migrate(db)).toEqual({ applied: [1], current: 1 });
    expect(migrate(db)).toEqual({ applied: [], current: 1 });
  });
});
