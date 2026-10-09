-- =============================================================================
-- Migration 002 — evento exercicio_desmarcado (desfazer "resolvi").
--
-- O SQLite não altera um CHECK: a tabela de eventos é reconstruída com a
-- lista nova e as mesmas linhas (ids e instantes preservados). A view que lê
-- a tabela sai antes e volta depois, porque o RENAME valida o schema.
-- =============================================================================

DROP VIEW v_area_xp;

CREATE TABLE progress_event_new (
  id          INTEGER PRIMARY KEY,
  user_id     INTEGER NOT NULL REFERENCES app_user(id),
  node_id     INTEGER REFERENCES node(id),
  type        TEXT NOT NULL CHECK (type IN (
                'iniciou', 'criterio_marcado', 'criterio_desmarcado',
                'guia_lida', 'guia_desmarcada',
                'exercicio_tentado', 'exercicio_resolvido', 'exercicio_desmarcado',
                'revisao', 'sessao_estudo')),
  payload     TEXT,
  xp          INTEGER NOT NULL DEFAULT 0,
  occurred_at TEXT NOT NULL DEFAULT (datetime('now'))
);

INSERT INTO progress_event_new (id, user_id, node_id, type, payload, xp, occurred_at)
SELECT id, user_id, node_id, type, payload, xp, occurred_at FROM progress_event;

DROP TABLE progress_event;
ALTER TABLE progress_event_new RENAME TO progress_event;

CREATE INDEX idx_event_user_time ON progress_event(user_id, occurred_at);
CREATE INDEX idx_event_user_node ON progress_event(user_id, node_id);

CREATE VIEW v_area_xp AS
SELECT e.user_id, a.id AS area_id, a.slug, SUM(e.xp) AS xp
FROM progress_event e
JOIN node n   ON n.id = e.node_id
JOIN branch b ON b.id = n.home_branch_id
JOIN area a   ON a.id = b.area_id
GROUP BY e.user_id, a.id;
