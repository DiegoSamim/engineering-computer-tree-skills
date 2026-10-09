/** Chave pública de uma branch: `area/branch` (o slug da branch só é único dentro da área). */
export function branchKey(area: string, branch: string): string {
  return `${area}/${branch}`;
}

export function parseBranchKey(key: string): { area: string; branch: string } | null {
  const parts = key.split('/');
  if (parts.length !== 2 || !parts[0] || !parts[1]) return null;
  return { area: parts[0], branch: parts[1] };
}
