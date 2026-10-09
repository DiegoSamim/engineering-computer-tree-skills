# Backend da skill tree — SQLite

API local, single-user, sem dependências: `node:sqlite`, `node:http` e um roteador de poucas linhas. TypeScript roda direto com `node --experimental-strip-types`.

> **Restrição:** strip-types não aceita sintaxe que gere código (`enum`, `namespace`, parameter properties) e exige imports com extensão (`./db.ts`). Vale também para `src/domain/tree/`, que o servidor importa.

## Como rodar

```bash
npm run server          # só a API, porta 8787 (gera o catálogo antes)
./scripts/start.sh      # API + Vite
```

Variáveis: `PORT` (8787), `HOST` (127.0.0.1), `DB_PATH` (`data/skill-tree.db`).

O progresso do roadmap antigo (`data/study.db`) não é migrado: o boot avisa e deixa o arquivo intacto.

## Boot

1. Abre o banco e aplica as migrations (`migrations/001_skill_tree.sql`, vinda de `docs/db/schema.sql` com os desvios do `CLAUDE.md`).
2. Lê `src/generated/catalog.json` e semeia o catálogo (`catalog/seed.ts`): idempotente por slug, sem trocar ids. Critérios e exercícios são atualizados por (nó, slug), porque o progresso aponta para eles. Um nó removido do conteúdo que tem progresso **impede o boot**: slugs são permanentes.
3. Roda `catalog/validate.sql` (cópia de `docs/db/validate.sql`); qualquer erro impede o boot.
4. `ProgressStore.rebuild()` refaz o estado materializado a partir do log, para os níveis acompanharem critérios que mudaram.

## Regras

- **`progress_event` é a fonte da verdade** (só INSERT). `user_node`, `user_criterion`, `user_guide` e `user_exercise` são estado materializado e podem ser refeitos do log.
- **O servidor não reimplementa regra.** O nível vem de `levelFromCriteria` e o XP de `xpFor`, de `src/domain/tree`. Estados e contadores vêm das views SQL, e `__tests__/schema.test.ts` prova que elas dão o mesmo resultado que a derivação em TypeScript em todos os cenários de `docs/db/test_schema.py`.
- **Evento que não muda nada não é gravado** (marcar o que já está marcado): o log e o XP não inflam. A resposta diz `recorded: false`.
- Referência desconhecida (nó, critério, guia, exercício) é **400** e não suja o log.

## API

```
GET   /api/health    → { ok, nodes, events, uptimeSeconds }
GET   /api/catalog   → Catalog (áreas, branches, nós com placements, requisitos, critérios, exercícios)
GET   /api/state     → TreeState (estado de cada nó, contadores de branch e área, XP, totais)
POST  /api/events    ← ProgressEventInput → { recorded, state }
PATCH /api/me        ← { displayName } → TreeState
GET   /api/export    → { version: 1, events }
POST  /api/import    ← mesmo formato → { imported, skipped, state }
POST  /api/reset     → TreeState vazio
```

Eventos (`src/domain/tree/types.ts`):

```
{ type: 'iniciou', node }
{ type: 'criterio_marcado' | 'criterio_desmarcado', node, criterion }
{ type: 'guia_lida' | 'guia_desmarcada', node, guide }
{ type: 'exercicio_tentado' | 'exercicio_resolvido', node, exercise }
{ type: 'sessao_estudo', node, seconds }
```

Os tipos de resposta (`TreeState`, `EventResponse`...) ficam em `src/domain/tree/api.ts`, compartilhados com o front. Sem CORS: o Vite faz proxy de `/api`. Sem autenticação, escutando só em `127.0.0.1`.

## Estrutura

```
server/
  index.ts              boot
  db.ts                 conexão, PRAGMA, transação
  http.ts               roteador mínimo, HttpError
  routes.ts             as rotas
  migrations/           001_skill_tree.sql + runner idempotente
  catalog/              load (JSON gerado), seed, read, validate.sql
  progress/             events (validação de entrada), store (log + materialização), state (leitura das views)
  __tests__/            schema × domínio, catálogo, store, rotas
```

`npm run catalog -- --seed <banco>` semeia um banco sem subir a API.
