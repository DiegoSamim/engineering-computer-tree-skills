# Backend de estudo — SQLite

> **Status: implementado.** Progresso, migração e export/import funcionando.
> Revisão espaçada e error log têm tabela criada, mas ainda não têm rota nem tela.

## Zero dependências

O backend inteiro usa só o que vem no Node 22:

| Peça | O quê |
|---|---|
| Banco | `node:sqlite` (`DatabaseSync`) — sem driver nativo, sem `node-gyp` |
| HTTP | `node:http` + um roteador de ~30 linhas em `http.ts` |
| TypeScript | `node --experimental-strip-types` — o `tsconfig` já exige `erasableSyntaxOnly` |
| Validação | `validate.ts`, escrito à mão |

Consequência prática: nenhum `npm install` pode falhar e nada precisa ser recompilado quando a
versão do Node muda.

> **Restrição a respeitar:** strip-types não aceita sintaxe que *gere* código —
> nada de `enum`, `namespace` ou *parameter property* (`constructor(private x)`).
> Use campos explícitos. `erasableSyntaxOnly` no `tsconfig` pega isso no build.
> Imports precisam de extensão explícita: `./db.ts`, não `./db`.

## Como rodar

```bash
npm run server          # só a API, porta 8787
./scripts/start.sh      # API + Vite juntos (é o que o atalho do Windows chama)
```

Variáveis: `PORT` (8787), `HOST` (127.0.0.1), `DB_PATH` (`data/study.db`).

## A regra central

O servidor **não reimplementa** as regras de progresso. `store.append()` grava o fato no log e
chama `applyProgressEvent` — a mesma função de [`src/data/reducer.ts`](../src/data/reducer.ts)
que o navegador usa — para derivar o estado.

Duas implementações das mesmas regras divergiriam com o tempo; uma não pode. O teste
`server/__tests__/store.test.ts` trava isso: aplicar N eventos pelo store tem que produzir
snapshot **idêntico** ao fold puro do reducer.

## Duas camadas

1. **`progress_event`** — log append-only, fonte da verdade, nunca sofre `UPDATE`.
2. **Tabelas derivadas** — `topic_progress`, `mastery_check`, etc. Leitura rápida, sempre
   reconstruíveis: `store.rebuild()` reprocessa o log inteiro.

É isso que dá o "versionado": além das migrations numeradas, o histórico de *o que foi feito e
quando* fica preservado. Bug na materialização se corrige reprocessando, sem perder dado.

## API

```
GET  /api/health              → { ok, schemaVersion, events, uptimeSeconds }
GET  /api/progress            → ProgressSnapshot completo em uma chamada
POST /api/progress/events     ← ProgressEvent → ProgressSnapshot
GET  /api/export              → { schemaVersion, events: StoredEvent[] }
POST /api/import              ← mesmo formato → { snapshot, imported, skipped }
POST /api/reset               → snapshot vazio
```

Sem CORS: o Vite faz proxy de `/api` → `127.0.0.1:8787`, então tudo é same-origin.
Sem autenticação, escutando só em `127.0.0.1` — é single-user local.

Eventos de tópicos fora do catálogo são recusados com **400** (`UnknownTopicError`). No
`/api/import` eles são apenas descartados e contados em `skipped`, para que um id obsoleto não
inviabilize a migração inteira.

## Ligação com o frontend

| Arquivo | Papel |
|---|---|
| `src/data/httpRepository.ts` | Implementa `ProgressRepository` sobre `fetch`. |
| `src/data/bootstrap.ts` | Decide local × servidor; roda a migração uma única vez. |
| `src/data/repository.ts` | Ponto único de troca do adaptador. |

Sem `VITE_API_URL`, o app roda 100% standalone no `localStorage` — o modo anterior não foi
perdido. Com a variável (o `start.sh` define `/api`), passa a falar com o servidor.

**Se o servidor estiver fora do ar, o app mostra uma falha visível e não grava no navegador.**
Fallback silencioso criaria duas fontes de verdade divergindo sem ninguém perceber.

## Migração do localStorage

No primeiro boot com API disponível e banco vazio, `bootstrap.ts` envia o log local para
`/api/import` e marca `lc.progress.migratedToServer`. Os `occurredAt` originais são preservados —
o histórico não é achatado para "agora". Reabrir não duplica.

## Estrutura

```
server/
  index.ts            bootstrap: abre o banco, migra, semeia, sobe o HTTP
  db.ts               conexão + PRAGMA + helper de transação
  migrations/
    001_initial.sql   esquema inicial
    run.ts            runner idempotente (tabela schema_migrations)
  seed.ts             espelha src/content/roadmap.ts para section/topic
  store.ts            SqliteProgressStore
  validate.ts         validadores de ProgressEvent
  http.ts             roteador mínimo
  routes.ts           as seis rotas
```

## Próximos passos

1. `review_schedule` — repetição espaçada (SM-2) + tela de revisão.
2. `error_log` — registro de por que errou + revisão semanal.
3. `study_session` — tempo real de estudo por tópico.

As três tabelas já existem; falta rota e tela.
