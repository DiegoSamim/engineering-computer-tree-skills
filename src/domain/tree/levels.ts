import type { CriterionDef } from './types.ts';

/** Nomes dos níveis padrão. Nível N fica em LEVEL_NAMES[N - 1]. */
export const LEVEL_NAMES = ['Entendi', 'Pratiquei', 'Dominei'] as const;

export function levelName(level: number): string {
  return LEVEL_NAMES[level - 1] ?? `Nível ${level}`;
}

/**
 * Nível atingido a partir dos critérios marcados.
 *
 * O nível N é atingido quando todos os critérios de nível ≤ N estão marcados.
 * Um nível sem critérios não pode ser atingido, então um nó sem critérios
 * fica no nível 0 (decisão: nó sem conteúdo não evolui).
 */
export function levelFromCriteria(
  criteria: Pick<CriterionDef, 'id' | 'level'>[],
  checked: Iterable<string>,
  maxLevel: number,
): number {
  const done = new Set(checked);
  let level = 0;
  for (let n = 1; n <= maxLevel; n++) {
    const ofLevel = criteria.filter((c) => c.level === n);
    if (ofLevel.length === 0 || !ofLevel.every((c) => done.has(c.id))) break;
    level = n;
  }
  return level;
}
