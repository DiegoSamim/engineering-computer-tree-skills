-- Exemplo pequeno que exercita: espelho, requisito OU, requisito de branch
-- inteira, requisito entre áreas e nível mínimo.

INSERT INTO area (id, slug, name, color, position) VALUES
  (1, 'fundamentos', 'Fundamentos', '#e8b04a', 1),
  (4, 'dados',       'Dados',       '#e07a4a', 4),
  (10,'eng-software','Engenharia de Software', '#7aa7e0', 10);

INSERT INTO branch (id, area_id, slug, name, position) VALUES
  (11, 1, 'complexidade',        'Complexidade e análise', 1),
  (12, 1, 'estruturas-de-dados', 'Estruturas de dados',    2),
  (13, 1, 'padroes',             'Padrões de resolução',   3),
  (41, 4, 'indexacao',           'Indexação e otimização', 3),
  (101,10,'system-design',       'System Design',          3);

INSERT INTO node (id, slug, home_branch_id, title, kind, content_status, max_level) VALUES
  (1, 'big-o',             11, 'Big-O',                 'conceito', 'rascunho',  3),
  (2, 'arrays',            12, 'Arrays',                'conceito', 'publicado', 3),
  (3, 'hashing',           12, 'Hash Map / Hash Set',   'conceito', 'rascunho',  3),
  (4, 'ordenacao',         13, 'Ordenação',             'padrao',   'planejado', 3),
  (5, 'two-pointers',      13, 'Two Pointers',          'padrao',   'publicado', 3),
  (6, 'sliding-window',    13, 'Sliding Window',        'padrao',   'planejado', 3),
  (7, 'indice-hash',       41, 'Índice hash',           'conceito', 'planejado', 2),
  (8, 'consistent-hashing',101,'Consistent hashing',    'conceito', 'planejado', 2);

-- Casa de cada nó + espelhos (hashing aparece em Indexação e System Design).
INSERT INTO node_placement (branch_id, node_id, role, x, y) VALUES
  (11, 1, 'tronco',  .5, .2),
  (12, 2, 'tronco',  .5, .2),
  (12, 3, 'tronco',  .5, .5),
  (13, 4, 'lateral', .2, .3),
  (13, 5, 'tronco',  .5, .3),
  (13, 6, 'tronco',  .6, .6),
  (41, 3, 'tronco',  .3, .2),   -- espelho
  (41, 7, 'tronco',  .5, .5),
  (101,3, 'tronco',  .2, .2),   -- espelho
  (101,8, 'tronco',  .5, .5);

INSERT INTO requirement (node_id, req_node_id, req_branch_id, min_level, strength, alt_group) VALUES
  (3, 2,    NULL, 1, 'obrigatorio', NULL),   -- Hashing exige Arrays
  (5, 2,    NULL, 1, 'obrigatorio', NULL),   -- Two Pointers exige Arrays
  (5, 4,    NULL, 1, 'obrigatorio', 1),      --   E (Ordenação
  (5, 3,    NULL, 1, 'obrigatorio', 1),      --      OU Hashing)
  (5, NULL, 11,   1, 'recomendado', NULL),   -- recomenda a branch Complexidade
  (6, 5,    NULL, 2, 'obrigatorio', NULL),   -- Sliding Window exige Two Pointers nível 2
  (7, 3,    NULL, 2, 'obrigatorio', NULL),   -- Índice hash (Dados) exige Hashing nível 2
  (8, 3,    NULL, 1, 'obrigatorio', NULL);   -- Consistent hashing (Eng. Software) exige Hashing

INSERT INTO node_relation VALUES (5, 6, 'compara_com'), (3, 7, 'aplica_em');

INSERT INTO node_criterion (node_id, level, description) VALUES
  (5, 1, 'Explicar as variações (extremos opostos, mesma direção) sem consultar'),
  (5, 2, 'Resolver 3 exercícios médios'),
  (5, 3, 'Refazer um exercício 7 dias depois, sem consultar, cronometrado');

INSERT INTO track (id, slug, name, goal) VALUES (1, 'live-coding', 'Live coding', 'Entrevistas técnicas');
INSERT INTO track_node VALUES (1, 2, 1, 'core'), (1, 3, 2, 'core'), (1, 5, 3, 'core'), (1, 6, 4, 'core');

INSERT INTO app_user (id, handle) VALUES (1, 'diego');
