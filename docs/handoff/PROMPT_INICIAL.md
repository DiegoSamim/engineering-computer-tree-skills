Vamos refatorar este repositório de um roadmap de live coding para uma árvore de habilidades de computação (áreas → branches → nós).

Antes de qualquer coisa, leia nesta ordem:
1. `CLAUDE.md` (decisões já tomadas e as fases)
2. `docs/catalogo.md`
3. `docs/db/schema.sql` e `docs/db/test_schema.py`
4. `docs/design-system/README.md` e `docs/design-system/tokens.json`
5. `docs/reference/prototipo.html` (leia o código; é a referência de comportamento e visual das quatro telas)

Depois explore o código atual (`src/`, `server/`) e me devolva, sem escrever código ainda:
- Um mapa do que existe hoje e do destino de cada parte: mantém, move, reescreve ou apaga.
- Qualquer conflito ou lacuna que você encontrar entre os documentos e o código, com sua recomendação.
- O plano detalhado das Fases 0 e 1 (arquivos a criar, mover e apagar, e os testes que vão provar que a fase terminou).

Espere minha aprovação. Depois execute a Fase 0, rode `npm test`, `npm run build` e `npm run lint`, e pare para eu validar antes da Fase 1. Siga o mesmo ciclo nas fases seguintes: plano curto, execução, verificação, pausa.
