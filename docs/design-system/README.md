# Constelação

O design system do Engineering Computer Tree Skills: um mapa de estudos de computação desenhado como um céu. Áreas são orbes, branches são constelações, nós são estrelas que acendem conforme você estuda. A página de cada nó apaga o céu e vira uma mesa de leitura.

## Três profundidades, dois registros

| Profundidade | Tela | Registro |
|---|---|---|
| Céu | 10 áreas em volta de "Computação" | Cor viva, brilho, movimento |
| Constelação | O carrossel de branches da área e a constelação expandida | Cor viva só onde há progresso |
| Página | O nó, com as 12 guias | Sóbrio: céu a 18%, uma cor de acento, tipografia faz o trabalho |

A regra que une os três: **fundo sólido escuro, cor só onde ela significa algo**. Uma estrela acesa é progresso real; uma linha acesa é um requisito cumprido. Nada é colorido por decoração.

## Cor

- `bg` é sólido. Nunca gradiente de fundo, nunca imagem de nebulosa. O contraste entre o fundo plano e as cores vivas das áreas é a identidade.
- Cada área tem uma cor (`area-*`). Ao entrar numa área, a cor dela vira `--c` e tinge a tela inteira: anéis, linhas acesas, títulos, botões, foco.
- Brilho (`glow-*`) é sempre a cor da área a ~28% de opacidade. Use em estrelas dominadas, orbes e controles marcados, nunca em texto corrido.
- Um espelho (nó de outra branch) leva o anel tracejado na cor da **área de origem**. É o único lugar onde duas cores de área convivem numa constelação.
- `ink-faint` passa 4.5:1 sobre `bg` e `bg-raised`; `line-strong` não é cor de texto.

## Tipografia

- **Sora**, leve (300), para nomes: áreas, branches, nós, guias. Grande e fino, como as legendas de constelação.
- **IBM Plex Sans** para leitura. Linha de até 66 caracteres. O primeiro parágrafo de cada guia vai em `ink` e `lead`; os seguintes em `ink-muted`.
- **JetBrains Mono** para tudo que é número: contadores (`4 / 11`), numeração de guia (`04 / 12`), Big-O e código.
- Eyebrows (`eyebrow`) em maiúsculas com 0.42em de espaçamento: "F U N D A M E N T O S".

## Estados de um nó

O banco grava só o nível. O estado que a tela mostra é calculado a partir dos requisitos.

| Estado | Estrela | Quando |
|---|---|---|
| Dominado | Preenchida, halo pulsando devagar | Nível máximo |
| Em progresso | Anel + arco de progresso + ponto central | Nível 1 até o máximo − 1 |
| Estudando | Anel com pulso que se expande | Iniciado, nível 0 |
| Disponível | Anel na cor da área a 80% | Requisitos obrigatórios cumpridos |
| Bloqueado | Anel em `ink-faint` | Falta requisito |
| Sem conteúdo | Qualquer estado acima, com anel pontilhado | `content_status = planejado` |
| Espelho | Segundo anel tracejado na cor da área de origem + rótulo "↗ branch" | Nó cuja casa é outra branch |

Linhas da constelação são requisitos. Acesa = cumprido. Pontilhada = alternativa (grupo OU). Recomendados não desenham linha.

## Movimento

Tudo usa `cubic-bezier(.22, .9, .24, 1)`: rápido no começo, assentando devagar.

- **Entrada de área:** a orbe clicada viaja para o centro e cresce enquanto as outras somem (`t-med`), e então o carrossel entra.
- **Constelação:** as linhas se desenham em sequência (`t-slow`, 40ms de defasagem).
- **Carrossel:** a carta central em escala 1, vizinhas a 0.78 e 38% de opacidade.
- **Página do nó:** só a guia troca (fade + 8px, `t-med`). O céu fica a 18%.
- Fundo: estrelas de 0.2–1.1px piscando lentamente. Desligado com `prefers-reduced-motion`, que reduz tudo a 1ms.

## Página do nó

- Uma guia por vez, nunca as 12 empilhadas. A navegação à esquerda é um tronco de constelação: pontos ligados por uma linha que acende até a guia atual.
- Guias lidas ficam com o ponto preenchido. Rodapé de cada guia: "Marcar como lida" e o botão para a próxima.
- Status, critérios e contadores saem da tela e vão para a gaveta **Domínio** (botão no cabeçalho com os pips de nível).
- No celular, a navegação vira uma faixa horizontal de pontos fixa no topo; só a guia atual mostra o nome.

## Iconografia

Ícones de linha, traço 1.5, cantos arredondados, em grade de 24. Uma figura por área (capelo, chip, nuvem, cilindro, escudo, engrenagem, colchetes, rede, faísca, blocos). Sem emoji, sem ícones preenchidos.

## Escrita

Português direto. Botões dizem o que fazem ("Abrir nó", "Marcar como lida"). Estados em uma palavra. Contadores sempre `feitos / total`.
