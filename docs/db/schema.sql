-- =============================================================================
-- Skill Tree de Computação — esquema (SQLite; portável para Postgres)
--
-- Duas metades que nunca se misturam:
--   CATÁLOGO  : o que existe (áreas, branches, nós, requisitos). Mesmo para
--               todo usuário. Gerado a partir dos arquivos de conteúdo.
--   PROGRESSO : o que cada usuário fez. Log de eventos + estado materializado.
--
-- Estados "bloqueado" / "disponível" NÃO são gravados: são calculados a partir
-- dos requisitos (views no fim do arquivo). Assim, adicionar um requisito novo
-- nunca deixa dado velho inconsistente.
-- =============================================================================
PRAGMA foreign_keys = ON;

-- ─────────────────────────────── CATÁLOGO ───────────────────────────────────

CREATE TABLE area (
  id          INTEGER PRIMARY KEY,
  slug        TEXT NOT NULL UNIQUE,              -- 'fundamentos'
  name        TEXT NOT NULL,
  description TEXT,
  color       TEXT,                              -- cor da constelação
  icon        TEXT,
  position    INTEGER NOT NULL
);

CREATE TABLE branch (
  id          INTEGER PRIMARY KEY,
  area_id     INTEGER NOT NULL REFERENCES area(id),
  slug        TEXT NOT NULL UNIQUE,              -- 'estruturas-de-dados'
  name        TEXT NOT NULL,
  description TEXT,
  icon        TEXT,
  position    INTEGER NOT NULL                   -- ordem no carrossel da área
);

-- Um nó = uma página de conteúdo. Tem UMA casa (home_branch_id).
CREATE TABLE node (
  id             INTEGER PRIMARY KEY,
  slug           TEXT NOT NULL UNIQUE,           -- chave estável; progresso depende dela
  home_branch_id INTEGER NOT NULL REFERENCES branch(id),
  title          TEXT NOT NULL,
  summary        TEXT,
  kind           TEXT NOT NULL
                   CHECK (kind IN ('padrao', 'conceito', 'ferramenta', 'caso')),
  content_status TEXT NOT NULL DEFAULT 'planejado'
                   CHECK (content_status IN ('planejado', 'rascunho', 'publicado')),
  content_path   TEXT,                           -- content/<area>/<branch>/<no>.mdx
  max_level      INTEGER NOT NULL DEFAULT 3 CHECK (max_level BETWEEN 1 AND 5),
  est_minutes    INTEGER
);

-- Onde o nó aparece DESENHADO. Uma linha na branch-casa + uma por espelho.
-- Espelho = placement cuja branch ≠ node.home_branch_id (derivado, não gravado).
-- x/y relativos (0..1) dão o formato livre da constelação, estilo Skyrim.
CREATE TABLE node_placement (
  branch_id INTEGER NOT NULL REFERENCES branch(id),
  node_id   INTEGER NOT NULL REFERENCES node(id) ON DELETE CASCADE,
  role      TEXT NOT NULL CHECK (role IN ('tronco', 'lateral')),
  x         REAL NOT NULL CHECK (x BETWEEN 0 AND 1),
  y         REAL NOT NULL CHECK (y BETWEEN 0 AND 1),
  PRIMARY KEY (branch_id, node_id)
);

-- Requisito: "node_id exige X". X é um nó OU uma branch inteira (de qualquer área).
--   * alt_group: requisitos com o mesmo grupo no mesmo nó formam um OU;
--                sem grupo, cada linha é um E.
--   * min_level: nível mínimo no requisito (ex.: Hashing nível 2).
--   * strength : 'recomendado' aparece na UI mas não bloqueia.
-- Requisito de branch = todos os nós de TRONCO dela no nível mínimo.
-- As linhas desenhadas entre nós de uma constelação SÃO estes requisitos.
CREATE TABLE requirement (
  id            INTEGER PRIMARY KEY,
  node_id       INTEGER NOT NULL REFERENCES node(id) ON DELETE CASCADE,
  req_node_id   INTEGER REFERENCES node(id) ON DELETE CASCADE,
  req_branch_id INTEGER REFERENCES branch(id) ON DELETE CASCADE,
  min_level     INTEGER NOT NULL DEFAULT 1 CHECK (min_level >= 1),
  strength      TEXT NOT NULL DEFAULT 'obrigatorio'
                  CHECK (strength IN ('obrigatorio', 'recomendado')),
  alt_group     INTEGER,
  CHECK ((req_node_id IS NULL) <> (req_branch_id IS NULL)),   -- exatamente um alvo
  CHECK (req_node_id IS NULL OR req_node_id <> node_id)
);
CREATE INDEX idx_req_node   ON requirement(node_id);
CREATE INDEX idx_req_target ON requirement(req_node_id);
CREATE UNIQUE INDEX uq_req_node   ON requirement(node_id, req_node_id)   WHERE req_node_id   IS NOT NULL;
CREATE UNIQUE INDEX uq_req_branch ON requirement(node_id, req_branch_id) WHERE req_branch_id IS NOT NULL;

-- Ligações que NÃO são requisito (alimentam "Comparação" e "Veja também").
CREATE TABLE node_relation (
  a_id INTEGER NOT NULL REFERENCES node(id) ON DELETE CASCADE,
  b_id INTEGER NOT NULL REFERENCES node(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('compara_com', 'aplica_em', 'ver_tambem')),
  PRIMARY KEY (a_id, b_id, type),
  CHECK (a_id <> b_id)
);

-- O que significa cada nível de um nó (torna a evolução objetiva).
-- Nível N é atingido quando todos os critérios de nível <= N estão marcados.
CREATE TABLE node_criterion (
  id          INTEGER PRIMARY KEY,
  node_id     INTEGER NOT NULL REFERENCES node(id) ON DELETE CASCADE,
  level       INTEGER NOT NULL CHECK (level >= 1),
  description TEXT NOT NULL,
  position    INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE exercise (
  id         INTEGER PRIMARY KEY,
  node_id    INTEGER NOT NULL REFERENCES node(id) ON DELETE CASCADE,
  slug       TEXT NOT NULL,
  title      TEXT NOT NULL,
  url        TEXT,
  difficulty TEXT CHECK (difficulty IN ('facil', 'medio', 'dificil')),
  UNIQUE (node_id, slug)
);

-- Trilhas: caminhos ordenados por objetivo, atravessando áreas
-- ("Live coding Nubank", "AWS Cloud Practitioner"). O mapa diz o que existe;
-- a trilha diz o que fazer agora.
CREATE TABLE track (
  id          INTEGER PRIMARY KEY,
  slug        TEXT NOT NULL UNIQUE,
  name        TEXT NOT NULL,
  goal        TEXT
);
CREATE TABLE track_node (
  track_id INTEGER NOT NULL REFERENCES track(id) ON DELETE CASCADE,
  node_id  INTEGER NOT NULL REFERENCES node(id) ON DELETE CASCADE,
  position INTEGER NOT NULL,
  priority TEXT NOT NULL DEFAULT 'core' CHECK (priority IN ('core', 'alta', 'media', 'baixa')),
  PRIMARY KEY (track_id, node_id)
);

-- ─────────────────────────────── PROGRESSO ──────────────────────────────────

CREATE TABLE app_user (
  id           INTEGER PRIMARY KEY,
  handle       TEXT NOT NULL UNIQUE,
  display_name TEXT,
  created_at   TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Fonte da verdade, só INSERT. Tudo abaixo pode ser reconstruído a partir dele.
CREATE TABLE progress_event (
  id          INTEGER PRIMARY KEY,
  user_id     INTEGER NOT NULL REFERENCES app_user(id),
  node_id     INTEGER REFERENCES node(id),
  type        TEXT NOT NULL CHECK (type IN (
                'iniciou', 'criterio_marcado', 'criterio_desmarcado',
                'exercicio_tentado', 'exercicio_resolvido',
                'revisao', 'sessao_estudo')),
  payload     TEXT,                              -- JSON (criterion_id, segundos, nota...)
  xp          INTEGER NOT NULL DEFAULT 0,
  occurred_at TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX idx_event_user_time ON progress_event(user_id, occurred_at);
CREATE INDEX idx_event_user_node ON progress_event(user_id, node_id);

-- Estado materializado por nó (leitura rápida).
CREATE TABLE user_node (
  user_id          INTEGER NOT NULL REFERENCES app_user(id),
  node_id          INTEGER NOT NULL REFERENCES node(id) ON DELETE CASCADE,
  level            INTEGER NOT NULL DEFAULT 0 CHECK (level >= 0),
  started_at       TEXT,
  completed_at     TEXT,                         -- quando atingiu max_level
  seconds_studied  INTEGER NOT NULL DEFAULT 0,
  next_review_at   TEXT,                         -- repetição espaçada
  review_interval  INTEGER NOT NULL DEFAULT 1,   -- dias
  PRIMARY KEY (user_id, node_id)
);

CREATE TABLE user_criterion (
  user_id      INTEGER NOT NULL REFERENCES app_user(id),
  criterion_id INTEGER NOT NULL REFERENCES node_criterion(id) ON DELETE CASCADE,
  checked_at   TEXT NOT NULL DEFAULT (datetime('now')),
  PRIMARY KEY (user_id, criterion_id)
);

CREATE TABLE user_exercise (
  user_id     INTEGER NOT NULL REFERENCES app_user(id),
  exercise_id INTEGER NOT NULL REFERENCES exercise(id) ON DELETE CASCADE,
  attempts    INTEGER NOT NULL DEFAULT 0,
  solved_at   TEXT,
  notes       TEXT,
  PRIMARY KEY (user_id, exercise_id)
);

-- ──────────────────────────────── VIEWS ─────────────────────────────────────

-- Cada requisito, para cada usuário: cumprido ou não.
CREATE VIEW v_requirement_met AS
SELECT
  u.id                           AS user_id,
  r.id                           AS requirement_id,
  r.node_id,
  COALESCE(r.alt_group, -r.id)   AS grp,      -- sem grupo = grupo próprio (E)
  r.strength,
  CASE
    WHEN r.req_node_id IS NOT NULL THEN
      COALESCE((SELECT un.level FROM user_node un
                WHERE un.user_id = u.id AND un.node_id = r.req_node_id), 0) >= r.min_level
    ELSE NOT EXISTS (
      SELECT 1 FROM node_placement p
      LEFT JOIN user_node un ON un.node_id = p.node_id AND un.user_id = u.id
      WHERE p.branch_id = r.req_branch_id AND p.role = 'tronco'
        AND COALESCE(un.level, 0) < r.min_level)
  END                            AS met
FROM requirement r CROSS JOIN app_user u;

-- Estado de cada nó para cada usuário. É o que a UI pinta.
CREATE VIEW v_node_state AS
WITH grp AS (          -- um grupo OU está ok se qualquer requisito dele estiver
  SELECT user_id, node_id, grp, MAX(met) AS ok
  FROM v_requirement_met WHERE strength = 'obrigatorio'
  GROUP BY user_id, node_id, grp
), unlocked AS (       -- o nó está liberado se todos os grupos estiverem ok
  SELECT user_id, node_id, MIN(ok) AS ok FROM grp GROUP BY user_id, node_id
)
SELECT
  u.id                     AS user_id,
  n.id                     AS node_id,
  n.slug,
  n.content_status,
  COALESCE(un.level, 0)    AS level,
  n.max_level,
  CASE
    WHEN COALESCE(un.level, 0) >= n.max_level THEN 'dominado'
    WHEN COALESCE(un.level, 0) >= 1           THEN 'em_progresso'
    WHEN un.started_at IS NOT NULL            THEN 'estudando'
    WHEN COALESCE(ul.ok, 1) = 1               THEN 'disponivel'
    ELSE 'bloqueado'
  END                      AS state,
  COALESCE(un.next_review_at <= datetime('now'), 0) AS review_due
FROM node n
CROSS JOIN app_user u
LEFT JOIN user_node un ON un.node_id = n.id AND un.user_id = u.id
LEFT JOIN unlocked ul  ON ul.node_id = n.id AND ul.user_id = u.id;

-- Contador da carta da branch ("9/16"), espelhos incluídos.
CREATE VIEW v_branch_progress AS
SELECT
  s.user_id,
  b.id                                               AS branch_id,
  b.slug,
  COUNT(*)                                           AS nodes_total,
  SUM(n.content_status = 'publicado')                AS nodes_with_content,
  SUM(s.level >= 1)                                  AS nodes_done,
  SUM(s.state = 'dominado')                          AS nodes_mastered,
  SUM(p.role = 'tronco')                             AS trunk_total,
  SUM(p.role = 'tronco' AND s.level >= 1)            AS trunk_done
FROM node_placement p
JOIN branch b       ON b.id = p.branch_id
JOIN node n         ON n.id = p.node_id
JOIN v_node_state s ON s.node_id = p.node_id
GROUP BY s.user_id, b.id;

-- XP por área (vai para a área-casa do nó, nunca duplica por espelho).
-- Base da tela de "atributos": nível por área estilo Cyberpunk.
CREATE VIEW v_area_xp AS
SELECT e.user_id, a.id AS area_id, a.slug, SUM(e.xp) AS xp
FROM progress_event e
JOIN node n   ON n.id = e.node_id
JOIN branch b ON b.id = n.home_branch_id
JOIN area a   ON a.id = b.area_id
GROUP BY e.user_id, a.id;
