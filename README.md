# Engineering Computer Tree Skills

Um mapa de estudos de computação em forma de árvore de habilidades. **Áreas** contêm **branches**; branches contêm **habilidades** (no código, `node`); cada habilidade é uma sessão de estudo. Habilidades têm requisitos entre si (inclusive entre áreas) e acendem conforme você estuda.

> **Em refatoração.** O projeto deixou de ser um roadmap de live coding. Backend (domínio, catálogo, banco, API) e telas estão prontos para o primeiro escopo de conteúdo: **Fundamentos / Padrões de resolução**, com Two Pointers completo. O laboratório de grafos continua em `/lab/grafos` até virar visualizador de habilidades. Decisões e fases: [`CLAUDE.md`](CLAUDE.md).

## Telas

| Rota | Tela |
|---|---|
| `/` | Céu: as 10 áreas em volta do computador central (lista no celular) |
| `/a/:area` | Carrossel sem fim de branches, com a constelação de cada uma em miniatura |
| `/a/:area/:branch` | Constelação: clicar numa estrela aproxima a câmera em perspectiva e abre o painel da habilidade |
| `/n/:slug#guia` | Página da habilidade: uma guia por vez, visualizador, gaveta Domínio com os critérios |

Teclado: Enter seleciona e abre, Esc sobe um nível, ← → no carrossel e entre guias. O visual segue o design system "Constelação" (`docs/design-system/`).

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
content/<area>/<branch>/<no>.yaml         uma habilidade: posição na constelação, requisitos, critérios por nível
src/content/topics/<slug>.ts              o corpo das 12 guias de uma habilidade publicada
```

`npm run catalog` valida tudo (inclusive ciclos de requisitos) e gera `src/generated/catalog.json`. Ele roda sozinho antes de `dev`, `build`, `test` e `server`; se o conteúdo estiver inválido, para com a lista de erros. O servidor semeia o banco a partir desse arquivo no boot.

Hoje o conteúdo cobre as 10 áreas e as 8 branches de Fundamentos (só metadados) e as habilidades de **Fundamentos / Padrões de resolução**, com Two Pointers completo.

## Estrutura

- `src/domain/tree/`: regras da árvore em funções puras (estado derivado, requisitos, níveis, contadores, validação).
- `content/`, `scripts/build-catalog.ts`: o catálogo.
- `server/`: API local e SQLite. Veja [`server/README.md`](server/README.md).
- `src/algorithms/`, `src/simulation/`, `src/player/`: motor das visualizações passo a passo (BFS, DFS, A*...).
- `src/ui/`: peças do design system (estrela, constelação, orbe, carta, pílula, pips, gaveta...).
- `src/features/{sky,area,branch,node}/`: as quatro telas; `src/store/views.ts` monta o que elas desenham.
- `src/styles/`: CSS por componente, só com os tokens de `src/index.css`.
- `src/visualizers/`: visualizadores de habilidades, num registry por chave (Two Pointers).
- `docs/`: catálogo planejado, esquema do banco, design system "Constelação" e protótipo de referência.

O roadmap original de entrevistas está em [`Roadmap_Live_Coding_Entrevistas.md`](Roadmap_Live_Coding_Entrevistas.md) e vai virar a trilha "Live coding".
