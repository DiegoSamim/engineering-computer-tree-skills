export interface Token {
  text: string;
  /** cm = comentário, st = string, kw = palavra-chave, nu = número. */
  kind?: 'cm' | 'st' | 'kw' | 'nu';
}

const RE = /(\/\/[^\n]*)|('(?:[^'\\]|\\.)*')|\b(function|let|const|return|if|else|while|for|null|number)\b|\b(\d+)\b/g;

/** Realce mínimo de TypeScript, o mesmo do protótipo. Sem dependência. */
export function highlight(source: string): Token[] {
  const tokens: Token[] = [];
  let last = 0;
  for (const m of source.matchAll(RE)) {
    const at = m.index ?? 0;
    if (at > last) tokens.push({ text: source.slice(last, at) });
    tokens.push({ text: m[0], kind: m[1] ? 'cm' : m[2] ? 'st' : m[3] ? 'kw' : 'nu' });
    last = at + m[0].length;
  }
  if (last < source.length) tokens.push({ text: source.slice(last) });
  return tokens;
}
