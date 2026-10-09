import { execFileSync } from 'node:child_process';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { loadCatalog } from '../catalog/load.ts';

const ROOT = join(import.meta.dirname, '../..');
const FIXTURES = join(import.meta.dirname, 'fixtures');

/** Roda o script como o npm roda, para provar que ele funciona sob strip-types. */
function runCli(args: string[]): { code: number; output: string } {
  try {
    const output = execFileSync(
      process.execPath,
      ['--experimental-strip-types', '--disable-warning=ExperimentalWarning', 'scripts/build-catalog.ts', ...args],
      { cwd: ROOT, encoding: 'utf8', stdio: 'pipe' },
    );
    return { code: 0, output };
  } catch (error) {
    const e = error as { status: number; stdout: string; stderr: string };
    return { code: e.status, output: e.stdout + e.stderr };
  }
}

describe('catálogo real (content/)', () => {
  const { catalog, errors } = loadCatalog({ contentDir: join(ROOT, 'content'), rootDir: ROOT });

  it('é válido', () => {
    expect(errors).toEqual([]);
  });

  it('tem as 10 áreas, as 8 branches de Fundamentos e os nós de Padrões', () => {
    expect(catalog.areas.map((a) => a.slug)).toEqual(['fund', 'hw', 'cloud', 'dados', 'seg', 'sis', 'dev', 'redes', 'ia', 'es']);
    expect(catalog.branches.every((b) => b.area === 'fund')).toBe(true);
    expect(catalog.branches).toHaveLength(8);
    expect(catalog.nodes.every((n) => n.home === 'fund/padroes')).toBe(true);
    expect(catalog.nodes).toHaveLength(9);
  });

  it('Two Pointers aponta para o corpo em TS e tem critérios em todo nível', () => {
    const tp = catalog.nodes.find((n) => n.slug === 'two-pointers')!;
    expect(tp.contentPath).toBe('src/content/topics/two-pointers.ts');
    expect(tp.criteria.map((c) => c.level)).toEqual([1, 1, 1, 2, 2, 2, 3, 3]);
    expect(tp.exercises).toHaveLength(5);
  });
});

describe('fixtures quebradas', () => {
  it('acusa ciclo', () => {
    const { errors } = loadCatalog({ contentDir: join(FIXTURES, 'ciclo'), rootDir: ROOT });
    expect(errors.some((e) => e.startsWith('[ciclo]'))).toBe(true);
  });

  it('acusa alvo inexistente e casa diferente da pasta', () => {
    const { errors } = loadCatalog({ contentDir: join(FIXTURES, 'alvo-inexistente'), rootDir: ROOT });
    expect(errors.some((e) => e.includes('casa "fund/outra" diferente da pasta "fund/padroes"'))).toBe(true);
    expect(errors.some((e) => e.startsWith('[alvo_inexistente]'))).toBe(true);
  });
});

describe('build-catalog (CLI)', () => {
  it('passa no conteúdo real', () => {
    const { code, output } = runCli(['--check']);
    expect(code).toBe(0);
    expect(output).toContain('10 áreas · 8 branches · 9 nós · 0 erros');
  });

  it('sai com código 1 quando o catálogo é inválido', () => {
    const { code, output } = runCli(['--check', '--dir', join(FIXTURES, 'ciclo')]);
    expect(code).toBe(1);
    expect(output).toContain('[ciclo]');
  });
});
