-- Checagens de integridade do catálogo (cópia de docs/db/validate.sql). Rode após cada seed:
-- qualquer linha retornada é um erro. (SQLite não aceita CTE dentro de
-- trigger, por isso ciclos são checados aqui e não no INSERT.)

-- 1. Ciclo de requisitos (A exige B que exige ... A). Branch expande para o tronco.
WITH RECURSIVE edge(src, dst) AS (
  SELECT node_id, req_node_id FROM requirement WHERE req_node_id IS NOT NULL
  UNION
  SELECT r.node_id, p.node_id
  FROM requirement r JOIN node_placement p
    ON p.branch_id = r.req_branch_id AND p.role = 'tronco'
),
walk(start, cur, path) AS (
  SELECT src, dst, '/' || src || '/' || dst || '/' FROM edge
  UNION ALL
  SELECT w.start, e.dst, w.path || e.dst || '/'
  FROM walk w JOIN edge e ON e.src = w.cur
  WHERE w.cur <> w.start
    AND (instr(w.path, '/' || e.dst || '/') = 0 OR e.dst = w.start)
)
SELECT 'ciclo' AS erro, path AS detalhe FROM walk WHERE cur = start;

-- 2. Nó sem placement na própria branch-casa (não seria desenhado).
SELECT 'sem_placement_na_casa', n.slug
FROM node n
WHERE NOT EXISTS (SELECT 1 FROM node_placement p
                  WHERE p.node_id = n.id AND p.branch_id = n.home_branch_id);

-- 3. Grupo OU com um único requisito (provável erro de digitação).
SELECT 'grupo_ou_unitario', n.slug || ' grupo ' || r.alt_group
FROM requirement r JOIN node n ON n.id = r.node_id
WHERE r.alt_group IS NOT NULL
GROUP BY r.node_id, r.alt_group HAVING COUNT(*) = 1;

-- 4. Requisito com nível mínimo acima do máximo do alvo (impossível de cumprir).
SELECT 'min_level_impossivel', n.slug || ' -> ' || t.slug
FROM requirement r
JOIN node n ON n.id = r.node_id
JOIN node t ON t.id = r.req_node_id
WHERE r.min_level > t.max_level;
