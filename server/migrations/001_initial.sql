-- =============================================================================
-- Migration 001 — esquema inicial.
--
-- Os tipos em `src/data/types.ts` são o contrato, e `src/data/reducer.ts` é a
-- MESMA lógica de fold que o servidor roda para materializar o estado derivado.
--
-- Duas camadas:
--   1. `progress_event` — log append-only, fonte da verdade, nunca sofre UPDATE.
--   2. tabelas derivadas — leitura rápida, sempre reconstruíveis a partir de (1).
--
-- A tabela `schema_migrations` é criada pelo runner, não aqui.
-- =============================================================================

CREATE TABLE IF NOT EXISTS profile (
  id           INTEGER PRIMARY KEY CHECK (id = 1),   -- single-user local
  display_name TEXT NOT NULL,
  created_at   TEXT NOT NULL,
  updated_at   TEXT NOT NULL
);

-- ── Catálogo ─────────────────────────────────────────────────────────────────
-- Espelho de `src/content/roadmap.ts`, semeado de forma idempotente no boot.
-- O conteúdo continua versionado no git; estas tabelas existem para integridade
-- referencial e para permitir consultas (ex.: "quantos CORE faltam no nível 3").
CREATE TABLE IF NOT EXISTS section (
  id       TEXT PRIMARY KEY,
  level    INTEGER,                                   -- NULL nas trilhas paralelas
  title    TEXT NOT NULL,
  kind     TEXT NOT NULL CHECK (kind IN ('principal', 'paralela')),
  position INTEGER NOT NULL,
  roi_weight REAL NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS topic (
  id          TEXT PRIMARY KEY,
  section_id  TEXT NOT NULL REFERENCES section(id),
  name        TEXT NOT NULL,
  priority    TEXT NOT NULL CHECK (priority IN ('CORE', 'ALTA', 'MEDIA', 'BAIXA')),
  position    INTEGER NOT NULL,
  has_content INTEGER NOT NULL DEFAULT 0
);

-- ── Log append-only ──────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS progress_event (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  occurred_at TEXT NOT NULL,
  type        TEXT NOT NULL,        -- espelha ProgressEvent['type']
  topic_id    TEXT REFERENCES topic(id),
  payload     TEXT NOT NULL         -- JSON do evento completo
);
CREATE INDEX IF NOT EXISTS idx_event_topic ON progress_event(topic_id, occurred_at);
CREATE INDEX IF NOT EXISTS idx_event_time  ON progress_event(occurred_at);

-- ── Estado derivado ──────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS topic_progress (
  topic_id        TEXT PRIMARY KEY REFERENCES topic(id),
  status          TEXT NOT NULL DEFAULT 'nao-iniciado'
                    CHECK (status IN ('nao-iniciado', 'em-estudo', 'concluido')),
  started_at      TEXT,
  completed_at    TEXT,
  updated_at      TEXT NOT NULL,
  seconds_studied INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS topic_section_progress (
  topic_id     TEXT NOT NULL REFERENCES topic(id),
  section_key  TEXT NOT NULL,       -- chave de TOPIC_SECTIONS
  completed_at TEXT NOT NULL,
  PRIMARY KEY (topic_id, section_key)
);

-- As 8 dimensões de §08 do roadmap.
CREATE TABLE IF NOT EXISTS mastery_check (
  topic_id   TEXT NOT NULL REFERENCES topic(id),
  dimension  TEXT NOT NULL CHECK (dimension IN (
               'reconhecimento','modelagem','implementacao','correcao',
               'complexidade','validacao','retencao','performance')),
  checked    INTEGER NOT NULL DEFAULT 0,
  updated_at TEXT NOT NULL,
  PRIMARY KEY (topic_id, dimension)
);

CREATE TABLE IF NOT EXISTS exercise_progress (
  topic_id        TEXT NOT NULL REFERENCES topic(id),
  exercise_id     TEXT NOT NULL,
  done            INTEGER NOT NULL DEFAULT 0,
  attempts        INTEGER NOT NULL DEFAULT 0,
  last_attempt_at TEXT,
  notes           TEXT,
  PRIMARY KEY (topic_id, exercise_id)
);

-- ── Sustentam os itens CORE da trilha de método (§06 do roadmap) ─────────────
-- Nenhum destes tem tela ainda; o schema existe para que a fase seguinte não
-- precise de migration destrutiva.
CREATE TABLE IF NOT EXISTS review_schedule (
  topic_id         TEXT PRIMARY KEY REFERENCES topic(id),
  due_at           TEXT NOT NULL,
  interval_days    INTEGER NOT NULL DEFAULT 1,
  ease             REAL NOT NULL DEFAULT 2.5,
  last_reviewed_at TEXT
);

CREATE TABLE IF NOT EXISTS error_log (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  occurred_at TEXT NOT NULL,
  topic_id    TEXT REFERENCES topic(id),
  problem     TEXT,
  category    TEXT CHECK (category IN ('reconhecimento','modelagem','implementacao','borda')),
  note        TEXT
);

CREATE TABLE IF NOT EXISTS study_session (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  topic_id   TEXT REFERENCES topic(id),
  started_at TEXT NOT NULL,
  ended_at   TEXT,
  seconds    INTEGER
);
