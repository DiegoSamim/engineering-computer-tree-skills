import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

const ROOT = join(import.meta.dirname, '../..');
const tokens = JSON.parse(readFileSync(join(ROOT, 'docs/design-system/tokens.json'), 'utf8')) as {
  color: { tokens: { name: string; value: string }[] };
  radius: { tokens: { name: string; value: string }[] };
  duration: { tokens: { name: string; value: string }[] };
};
const css = readFileSync(join(ROOT, 'src/index.css'), 'utf8');

/** Valor de uma custom property declarada em src/index.css. */
function declared(name: string): string | undefined {
  return new RegExp(`--${name}:\\s*([^;]+);`).exec(css)?.[1].trim();
}

// O CLAUDE.md pede tokens copiados de docs/design-system/tokens.json. Este
// teste trava a cópia: mudar um valor lá sem mudar aqui (ou o contrário) falha.
describe('tokens do design system em src/index.css', () => {
  it.each(tokens.color.tokens.map((t) => [t.name, t.value]))('cor %s', (name, value) => {
    expect(declared(`color-${name}`)?.toLowerCase()).toBe(value.toLowerCase());
  });

  it.each(tokens.radius.tokens.map((t) => [t.name, t.value]))('raio %s', (name, value) => {
    expect(declared(name)).toBe(value);
  });

  it.each(tokens.duration.tokens.map((t) => [t.name, t.value]))('duração %s', (name, value) => {
    expect(declared(name)).toBe(value);
  });
});

describe('nenhuma cor literal em componente', () => {
  // Telas e peças da árvore. O lab de grafos (src/features/lab, src/components)
  // tem cores próprias e fica de fora até virar visualizador.
  const DIRS = ['src/ui', 'src/app', 'src/features/sky', 'src/features/area', 'src/features/branch', 'src/features/node'];
  const files = DIRS.filter((dir) => existsSync(join(ROOT, dir))).flatMap((dir) =>
    (readdirSync(join(ROOT, dir), { recursive: true }) as string[])
      .filter((f) => f.endsWith('.tsx'))
      .map((f) => join(dir, f)),
  );

  it.each(files)('%s', (file) => {
    const source = readFileSync(join(ROOT, file), 'utf8');
    expect(source.match(/#[0-9a-fA-F]{3,8}\b|rgba?\(/g) ?? []).toEqual([]);
  });
});
