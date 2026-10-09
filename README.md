# Engineering Computer Tree Skills

Um mapa de estudos de computação em forma de árvore de habilidades. **Áreas** contêm **branches**; branches contêm **nós**; cada nó é uma sessão de estudo. Nós têm requisitos entre si (inclusive entre áreas) e acendem conforme você estuda.

> **Em refatoração.** O projeto está deixando de ser um roadmap de live coding. O backend novo (domínio, catálogo, banco e API) está pronto; as telas da árvore vêm a seguir. Por enquanto, só o laboratório de grafos (`/lab/grafos`) está no ar. Decisões e fases: [`CLAUDE.md`](CLAUDE.md).

## Executar localmente

Requer Node.js 22 ou superior.

```bash
npm install
./scripts/start.sh      # API (porta 8787) + interface (porta 5183)
```

Ou separados: `npm run server` e `npm run dev`. Para testar, gerar o build ou verificar o código:

```bash
npm test
npm run build
npm run lint
```

## Como o conteúdo vira catálogo

```
content/<area>/_area.yaml                 metadados da área (nome, cor, ícone)
content/<area>/<branch>/_branch.yaml      metadados da branch
content/<area>/<branch>/<no>.yaml         um nó: posição na constelação, requisitos, critérios por nível
src/content/topics/<slug>.ts              o corpo das 12 guias de um nó publicado
```

`npm run catalog` valida tudo (inclusive ciclos de requisitos) e gera `src/generated/catalog.json`. Ele roda sozinho antes de `dev`, `build`, `test` e `server`; se o conteúdo estiver inválido, para com a lista de erros. O servidor semeia o banco a partir desse arquivo no boot.

Hoje o conteúdo cobre as 10 áreas e as 8 branches de Fundamentos (só metadados) e os nós de **Fundamentos / Padrões de resolução**, com Two Pointers completo.

## Estrutura

- `src/domain/tree/`: regras da árvore em funções puras (estado derivado, requisitos, níveis, contadores, validação).
- `content/`, `scripts/build-catalog.ts`: o catálogo.
- `server/`: API local e SQLite. Veja [`server/README.md`](server/README.md).
- `src/algorithms/`, `src/simulation/`, `src/player/`: motor das visualizações passo a passo (BFS, DFS, A*...).
- `src/visualizers/`: visualizadores de nós (Two Pointers).
- `docs/`: catálogo planejado, esquema do banco, design system "Constelação" e protótipo de referência.

O roadmap original de entrevistas está em [`Roadmap_Live_Coding_Entrevistas.md`](Roadmap_Live_Coding_Entrevistas.md) e vai virar a trilha "Live coding".
