# StarNode

A estrela que representa um nó na constelação; a forma diz o estado sem precisar de texto.

- Raio 12 no tronco, 9 nos laterais (em viewBox 600 × 520). Um disco de `bg` por baixo impede que as linhas atravessem a estrela.
- O estado vem de `v_node_state` (dominado, em progresso, estudando, disponível, bloqueado). "Sem conteúdo" e "espelho" são camadas que se somam a qualquer estado.
- Em progresso: o arco externo cobre `nível / nível máximo` da circunferência, começando no topo.
- Espelho: anel tracejado na cor da área de origem e rótulo "↗ <branch de origem>" abaixo do nome.
- Rótulo em `ink-muted` 13.5px com contorno de `bg` (`paint-order: stroke`) para não brigar com as linhas.
- Interação: foco por teclado (`tabindex`), clique seleciona e mostra o painel, Enter ou duplo clique abre o nó. Selecionada ganha um anel extra a 55%.
- O consumidor fornece: posição x/y (0–1), papel (tronco ou lateral), estado, nível, se é espelho e a cor da área de origem.
