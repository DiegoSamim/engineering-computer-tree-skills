import { DatabaseSync } from 'node:sqlite';
import { mkdirSync } from 'node:fs';
import { dirname } from 'node:path';

export type Db = DatabaseSync;

/**
 * Abre o banco e aplica os PRAGMA que importam para este uso.
 *
 * Passe ':memory:' nos testes — a mesma função serve aos dois casos, então o
 * que é testado é exatamente o que roda em produção.
 */
export function openDatabase(path: string): Db {
  if (path !== ':memory:') mkdirSync(dirname(path), { recursive: true });

  const db = new DatabaseSync(path);

  // WAL deixa leitura e escrita concorrentes sem travar uma à outra. Irrelevante
  // para um usuário só, mas é barato e evita surpresa se algum dia houver mais.
  if (path !== ':memory:') db.exec('PRAGMA journal_mode = WAL');
  db.exec('PRAGMA foreign_keys = ON');
  db.exec('PRAGMA busy_timeout = 5000');

  return db;
}

/**
 * Roda `fn` dentro de uma transação, revertendo tudo em caso de erro.
 *
 * É o que garante que um evento nunca entre no log sem que as tabelas
 * derivadas acompanhem — e vice-versa.
 */
export function transaction<T>(db: Db, fn: () => T): T {
  db.exec('BEGIN');
  try {
    const result = fn();
    db.exec('COMMIT');
    return result;
  } catch (error) {
    db.exec('ROLLBACK');
    throw error;
  }
}

/** node:sqlite não aceita boolean como parâmetro — converte para 0/1. */
export function bit(value: boolean | undefined): number {
  return value ? 1 : 0;
}
