import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { basename, join, relative } from 'node:path';
import { parse as parseYaml } from 'yaml';
import { parseArea, parseBranch, parseNode, type FieldError } from '../../src/domain/tree/frontmatter.ts';
import { branchKey } from '../../src/domain/tree/keys.ts';
import type { AreaDef, BranchDef, Catalog, NodeDef } from '../../src/domain/tree/types.ts';
import { validateCatalog } from '../../src/domain/tree/validate.ts';

/**
 * Lê `content/` e monta o catálogo:
 *
 *   content/<area>/_area.yaml
 *   content/<area>/<branch>/_branch.yaml
 *   content/<area>/<branch>/<no>.yaml
 *
 * O corpo do conteúdo de um nó fica em `src/content/topics/<slug>.ts`
 * (decisão: sem MDX por enquanto). Nó `publicado` precisa desse arquivo.
 */

export interface LoadOptions {
  contentDir: string;
  /** Pasta dos corpos de conteúdo. Padrão: src/content/topics. */
  topicsDir?: string;
  /** Raiz para os caminhos gravados em `contentPath`. Padrão: diretório atual. */
  rootDir?: string;
}

export interface BuildResult {
  catalog: Catalog;
  /** Mensagens prontas para o terminal. Vazio = catálogo válido. */
  errors: string[];
}

const isDir = (path: string) => statSync(path).isDirectory();
const visible = (name: string) => !name.startsWith('.') && !name.startsWith('_');

function readYaml(file: string, errors: FieldError[]): unknown {
  try {
    return parseYaml(readFileSync(file, 'utf8'));
  } catch (error) {
    errors.push({ file, field: '(yaml)', message: (error as Error).message.split('\n')[0] });
    return null;
  }
}

export function loadCatalog(options: LoadOptions): BuildResult {
  const rootDir = options.rootDir ?? process.cwd();
  const topicsDir = options.topicsDir ?? join(rootDir, 'src/content/topics');
  const fieldErrors: FieldError[] = [];
  const pathErrors: string[] = [];
  const show = (file: string) => relative(rootDir, file) || file;

  const areas: AreaDef[] = [];
  const branches: BranchDef[] = [];
  const nodes: NodeDef[] = [];

  if (!existsSync(options.contentDir)) {
    return { catalog: { areas, branches, nodes }, errors: [`pasta de conteúdo não encontrada: ${options.contentDir}`] };
  }

  for (const areaName of readdirSync(options.contentDir).filter(visible).sort()) {
    const areaDir = join(options.contentDir, areaName);
    if (!isDir(areaDir)) continue;

    const areaFile = join(areaDir, '_area.yaml');
    if (!existsSync(areaFile)) {
      pathErrors.push(`${show(areaDir)}: falta _area.yaml`);
      continue;
    }
    const area = parseArea(readYaml(areaFile, fieldErrors), show(areaFile));
    fieldErrors.push(...area.errors);
    if (!area.value) continue;
    if (area.value.slug !== areaName) pathErrors.push(`${show(areaFile)}: slug "${area.value.slug}" diferente da pasta "${areaName}"`);
    areas.push(area.value);

    for (const entry of readdirSync(areaDir).filter(visible).sort()) {
      const branchDir = join(areaDir, entry);
      if (!isDir(branchDir)) {
        pathErrors.push(`${show(branchDir)}: nós ficam dentro da pasta de uma branch`);
        continue;
      }

      const branchFile = join(branchDir, '_branch.yaml');
      if (!existsSync(branchFile)) {
        pathErrors.push(`${show(branchDir)}: falta _branch.yaml`);
        continue;
      }
      const branch = parseBranch(readYaml(branchFile, fieldErrors), area.value.slug, show(branchFile));
      fieldErrors.push(...branch.errors);
      if (!branch.value) continue;
      if (branch.value.slug !== entry) pathErrors.push(`${show(branchFile)}: slug "${branch.value.slug}" diferente da pasta "${entry}"`);
      branches.push(branch.value);

      const expectedHome = branchKey(area.value.slug, branch.value.slug);
      for (const file of readdirSync(branchDir).filter(visible).sort()) {
        const nodeFile = join(branchDir, file);
        if (!file.endsWith('.yaml')) {
          pathErrors.push(`${show(nodeFile)}: só arquivos .yaml descrevem nós`);
          continue;
        }
        const node = parseNode(readYaml(nodeFile, fieldErrors), show(nodeFile));
        fieldErrors.push(...node.errors);
        if (!node.value) continue;

        const fileSlug = basename(file, '.yaml');
        if (node.value.slug !== fileSlug) pathErrors.push(`${show(nodeFile)}: slug "${node.value.slug}" diferente do arquivo`);
        if (node.value.home !== expectedHome) {
          pathErrors.push(`${show(nodeFile)}: casa "${node.value.home}" diferente da pasta "${expectedHome}"`);
        }

        const body = join(topicsDir, `${node.value.slug}.ts`);
        if (existsSync(body)) node.value.contentPath = relative(rootDir, body);
        else if (node.value.content === 'publicado') {
          pathErrors.push(`${show(nodeFile)}: nó publicado sem conteúdo em ${show(body)}`);
        }
        nodes.push(node.value);
      }
    }
  }

  const catalog: Catalog = {
    areas: areas.sort((a, b) => a.position - b.position),
    branches: branches.sort((a, b) => a.key.localeCompare(b.key)),
    nodes: nodes.sort((a, b) => a.slug.localeCompare(b.slug)),
  };

  const errors = [
    ...fieldErrors.map((e) => `${e.file}: ${e.field} ${e.message}`),
    ...pathErrors,
    // Validação de catálogo só faz sentido com os arquivos íntegros.
    ...(fieldErrors.length === 0 ? validateCatalog(catalog).map((e) => `[${e.code}] ${e.where ? `${e.where}: ` : ''}${e.message}`) : []),
  ];

  return { catalog, errors };
}
