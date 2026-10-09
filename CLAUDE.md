# Engineering Computer Tree Skills

Mapa de estudos de computação em forma de árvore de habilidades. **Áreas** contêm **branches**; branches contêm **nós**; cada nó é uma página de conteúdo. Nós têm requisitos entre si (inclusive entre áreas) e acendem conforme o usuário estuda.

O projeto está sendo refatorado a partir de um roadmap de live coding (estado atual do repo). Este arquivo registra as decisões já tomadas. Não as reabra sem perguntar.

## Documentos de referência

| Arquivo | Para quê |
|---|---|
| `docs/catalogo.md` | As 10 áreas e suas branches (slugs, nomes, cores) |
| `docs/db/schema.sql` | Esquema do banco (fonte da verdade do modelo de dados) |
| `docs/db/validate.sql` | Checagens de integridade do catálogo (ciclos etc.) |
| `docs/db/seed_exemplo.sql`, `docs/db/test_schema.py` | Exemplo e cenários de teste do modelo. Os cenários devem virar testes Vitest |
| `docs/design-system/README.md`, `tokens.json`, `components/*.md` | Design system "Constelação" |
| `docs/reference/prototipo.html` | Protótipo navegável. Abrir no navegador. É a referência visual e de comportamento das telas |

Em caso de conflito: este arquivo > `docs/db/schema.sql` > design system > protótipo.

## Modelo de domínio (decidido)

- **Área → Branch → Nó**, três níveis fixos. Área: 5 a 10, muda raramente. Branch: 5 a 20 nós; passou disso, divide. Nó: uma sessão de estudo (30–90 min) que responde a uma pergunta.
- **Um nó tem uma casa só** (`home_branch`). Pode aparecer em outras branches como **espelho**: mesma página, mesmo progresso, desenhado com anel tracejado na cor da área de origem. Espelho não é tabela; é um `node_placement` cuja branch ≠ casa.
- **Placement** = onde o nó é desenhado numa branch: `x`, `y` (0–1) e papel (`tronco` | `lateral`). O formato da constelação vem das coordenadas e das linhas; não existe ordem linear gravada.
- **Requisitos** (`requirement`): o alvo é um nó OU uma branch inteira (= todos os nós de tronco dela), de qualquer área.
  - Linhas sem grupo = E. Mesmo `alt_group` no mesmo nó = OU.
  - `min_level`: nível mínimo no alvo.
  - `strength`: `obrigatorio` bloqueia; `recomendado` só aparece na UI.
  - As linhas desenhadas na constelação SÃO os requisitos entre nós da mesma branch.
- **Ligações não-requisito** (`node_relation`: compara_com, aplica_em, ver_tambem) alimentam a guia de comparação.
- **Progresso**: só o **nível** (0..`max_level`, padrão 3) é gravado por nó. Níveis: 1 Entendi, 2 Pratiquei, 3 Dominei. Cada nível tem critérios (`node_criterion`); o nível N é atingido quando todos os critérios de nível ≤ N estão marcados.
- **Estados são DERIVADOS, nunca gravados**: `bloqueado`, `disponivel`, `estudando` (iniciado, nível 0), `em_progresso` (1..max−1), `dominado` (max). A derivação existe em SQL (views) e em TypeScript (`src/domain`), e as duas precisam bater nos mesmos cenários de teste.
- **`content_status`** (`planejado` | `rascunho` | `publicado`) é independente do progresso: nó planejado aparece apagado/pontilhado.
- **Log de eventos** (`progress_event`, só INSERT) é a fonte da verdade do progresso; `user_node` é estado materializado. XP vai para a área-casa do nó, nunca duplicado por espelho.
- **Trilhas** (`track`) são caminhos ordenados por objetivo que atravessam áreas. O roadmap de live coding atual vira a primeira trilha.
- **Slugs são permanentes.** O progresso depende deles. Renomear exige tabela de apelidos; evite.
- **Nó sem critérios não evolui.** Sem `node_criterion`, o nível fica em 0 e o nó só pode ser iniciado (`estudando`). Se o nó tem critérios, todo nível de 1 a `max_level` precisa de pelo menos um.
- **XP**: `criterio_marcado` +10, `criterio_desmarcado` −10, demais eventos 0 (`xpFor` em `src/domain/tree`). Marcar o que já está marcado não grava evento.
- **Exercício resolvido é definitivo**: não existe evento para desfazer (`exercicio_resolvido` só grava uma vez). O check fica marcado e desabilitado.

### Desvios de `docs/db/schema.sql` (decididos)

- `branch`: `UNIQUE(area_id, slug)` em vez de `slug UNIQUE`, porque o catálogo repete slugs entre áreas. A chave pública é `area/branch`; as views expõem `branch_key`.
- `node_criterion` e `exercise` ganham `slug` (estável, `UNIQUE(node_id, slug)`); critério ganha `label`. O seed faz upsert por (nó, slug) para não apagar progresso.
- `node.visualizer TEXT` e `area.sub` (subtítulo curto, "Bases teóricas").
- Eventos `guia_lida` / `guia_desmarcada` e tabela `user_guide` ("Marcar como lida").
- Sem `PRAGMA` na migration (`openDatabase` liga as FKs).
- Os slugs de `seed_exemplo.sql` (`fundamentos`, `eng-software`...) são antigos: vale `docs/catalogo.md`.
- Requisito de branch sem nó de tronco é cumprido por vacuidade (como na view); a validação acusa `branch_sem_tronco`.

## Conteúdo (decidido)

- O conteúdo vive no git. **Metadados** de cada nó: `content/<area>/<branch>/<no>.yaml` (os campos do formato abaixo). **Corpo** das guias: `src/content/topics/<slug>.ts` (formato `TopicContent`). Decisão de 2026-10-09: **sem MDX por enquanto**; nó `publicado` exige o arquivo TS.
- Metadados de área e branch: `content/<area>/_area.yaml`, `content/<area>/<branch>/_branch.yaml`.
- Um script (`scripts/build-catalog.ts`) lê o frontmatter, valida (as mesmas regras de `validate.sql`, inclusive ciclos) e gera `src/generated/catalog.json` (não versionado; os scripts npm `pre*` o regeneram). O servidor semeia o SQLite no boot a partir desse JSON, de forma idempotente por slug. O build falha se a validação falhar.
- **Escopo inicial do conteúdo: só a área `fund` e a branch `fund/padroes`.** As outras áreas e branches de `docs/catalogo.md` entram depois.
- Formato do `.yaml` de um nó (requisito usa `min_level`; `strength` padrão `obrigatorio`; exercícios ficam no YAML, o texto "por que fazer" fica no TS):

```yaml
slug: two-pointers
title: Two Pointers
home: fund/padroes            # area/branch
kind: padrao                  # padrao | conceito | ferramenta | caso
content: publicado            # planejado | rascunho | publicado
max_level: 3
est_minutes: 45
summary: Dois índices que se movem de forma coordenada, eliminando possibilidades a cada passo.
place: { role: tronco, x: 0.5, y: 0.7 }
mirrors:                      # opcional: onde mais o nó aparece
  - { branch: dados/indexacao, role: lateral, x: 0.3, y: 0.8 }
requires:
  - { node: arrays }
  - { node: ordenacao, group: 1 }
  - { node: hashing, group: 1 }
  - { branch: fund/complexidade, strength: recomendado }
related:
  - { node: sliding-window, type: compara_com }
levels:
  - level: 1
    name: Entendi
    criteria:
      - { id: reconhecimento, label: Reconhecimento, text: "..." }
visualizer: two-pointers      # chave num registry, nunca um if
```

- O corpo tem as **12 guias** do arquétipo `padrao`, nesta ordem e com estes ids: `visao-geral`, `intuicao`, `analogia`, `visualizacao`, `quando-usar`, `complexidade`, `exemplos`, `codigo`, `erros-comuns`, `exercicios`, `resumo`, `revisao`. No TS, cada guia é um campo de `TopicContent`; os ids ficam em `src/domain/tree/guides.ts`. Outros arquétipos (conceito, ferramenta, caso) terão conjuntos próprios mais tarde; não os invente agora.
- Visualizadores ficam em `src/visualizers/<chave>/` e são registrados num registry. Reaproveite o motor existente (`src/simulation/`, `src/player/`) e os algoritmos de grafos (`src/algorithms/`): eles viram visualizadores dos nós BFS, DFS, A* etc.

## Telas e rotas (decidido)

| Rota | Tela | Referência |
|---|---|---|
| `/` | Céu: 10 orbes de área em volta de "Computação"; lista abaixo de 640px | protótipo, `AreaOrb` |
| `/a/:area` | Carrossel de branches com constelações em miniatura | `BranchCard` |
| `/a/:area/:branch` | Constelação expandida + painel do nó selecionado | `StarNode` |
| `/n/:slug` | Página do nó: uma guia por vez, navegação em tronco, gaveta Domínio | `GuideRail`, `StatePill` |

Comportamentos que precisam existir: transição orbe→área (orbe viaja ao centro e cresce), linhas da constelação se desenhando, clique seleciona estrela e Enter/duplo clique abre, Esc sobe um nível, ← → no carrossel e entre guias, deep link para guia (`/n/two-pointers#codigo`).

## Design (decidido)

Siga `docs/design-system/`. O resumo inegociável:

- Fundo **sólido** `#080b10`, sem gradiente nem imagem. Cor só onde significa algo (progresso, requisito cumprido, área ativa).
- A cor da área corrente vira a variável CSS `--c` e tinge a tela. Espelhos usam a cor da área de origem.
- Fontes: Sora 300/400 (títulos), IBM Plex Sans (texto), JetBrains Mono (números e código). Substituem o Inter atual.
- Página do nó é sóbria: céu de fundo a 18%, uma cor de acento, uma guia por vez, nada de painel lateral fixo (status e critérios ficam na gaveta Domínio).
- Movimento com `cubic-bezier(.22,.9,.24,1)`, durações 160/380/700ms. `prefers-reduced-motion` desliga tudo.
- Tokens em `src/index.css` via `@theme` do Tailwind 4, gerados ou copiados de `docs/design-system/tokens.json`. Nenhuma cor literal em componente.
- Texto passa 4.5:1. Foco visível em tudo que é clicável; estrelas são focáveis por teclado.

## Stack

Mantém: React 19, TypeScript, Vite, Tailwind 4, Zustand, React Router, Vitest, oxlint, servidor Node + SQLite (`server/`). Não adicione bibliotecas de grafo/canvas para as constelações: são SVG feitos à mão, como no protótipo. Pergunte antes de adicionar qualquer dependência de runtime.

## Regras de trabalho

- Trabalhe por **fases** (abaixo). Ao fim de cada fase: `npm test`, `npm run build` e `npm run lint` verdes, resumo do que mudou, e **pare para eu validar** antes da próxima.
- Antes de codar uma fase, apresente um plano curto (arquivos a criar, mover, apagar).
- Lógica de domínio (derivação de estado, requisitos, níveis, contadores, validação do catálogo) fica em funções puras em `src/domain/` com testes. Componentes não calculam estado.
- Não apague código existente que funcione (algoritmos, simulação, player, visualizador de Two Pointers) sem dizer para onde ele foi.
- Commits pequenos, em português, na branch `refactor/skill-tree`.
- Textos da interface em português, diretos; botões dizem o que fazem.

## Fases

Ordem seguida: backend (0, 1, 2), depois o frontend no escopo Fundamentos / Padrões (F). Próximo: Fase 6 (conteúdo).

0. **Build verde e limpeza.** `.gitignore` com `/data/`. `src/data/` (nunca commitado) **não** é recriado: as telas antigas (roadmap, tópico, sinais, onboarding) e a camada de progresso antiga são apagadas. Ficam lab de grafos, algoritmos, simulação, player e Two Pointers (visualizador em `src/visualizers/twoPointers/`, conteúdo em `src/content/topics/`, guias em `src/features/node/legacy/`). Pacote renomeado para `engineering-computer-tree-skills`.
1. **Domínio e catálogo.** Tipos, `build-catalog.ts`, validação, derivação de estado em `src/domain/tree/` (`src/domain/{types,graph}.ts` é o domínio do lab de grafos e fica onde está). Porte os cenários de `docs/db/test_schema.py` para Vitest. Conteúdo: `fund/_area.yaml`, `fund/padroes/_branch.yaml` e os nós da branch.
2. **Banco.** Novo arquivo `data/skill-tree.db`, migration a partir de `docs/db/schema.sql` (com os desvios acima), seed do catálogo, rotas para ler catálogo + estado e gravar eventos. O progresso antigo (`data/study.db`) não é migrado: o boot avisa e deixa o arquivo intacto.
F. **Frontend (F1–F5), escopo Fundamentos / Padrões — feito.** Céu, carrossel, constelação + painel, página do nó com as 12 guias, visualizador e gaveta Domínio, sobre a API. Céu e carrossel mostram as 10 áreas e as 8 branches de Fundamentos (só metadados); uma orbe sem branches não abre. Peças do design system em `src/ui/`, telas em `src/features/{sky,area,branch,node}/`, CSS por componente em `src/styles/`, dados de tela em `src/store/views.ts` (funções puras, com testes). Isto cobre o que as fases 3, 4 e 5 pediam para esse escopo; o que sobra delas entra junto com a Fase 6.
3. **Design system no código.** Tokens, fontes, céu de estrelas de fundo, componentes base (`Button`, `StatePill`, pips, `StarNode`).
4. **Telas de navegação.** Céu, carrossel, constelação + painel, rotas e transições.
5. **Página do nó.** Guias (corpo em TS), gaveta Domínio com critérios por nível, Two Pointers com o visualizador no novo estilo.
6. **Migração de conteúdo.** As outras áreas e branches de `docs/catalogo.md`. Tópicos de `src/content/roadmap.ts` viram nós `planejado` nas branches de Fundamentos; algoritmos do lab de grafos viram nós com visualizador (e `src/domain/{types,graph}.ts` vai junto para `src/visualizers/`); o roadmap vira a trilha "Live coding" (`content/_trilhas/`). Remova o lab só depois disso.
