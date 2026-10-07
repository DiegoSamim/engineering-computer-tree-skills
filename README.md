# Engineering Computer Tree Skills

Um roadmap interativo para explorar Engenharia de Computação como uma árvore de habilidades. Cada área forma um ramo, e seus tópicos se conectam por conceitos e pré-requisitos. O mapa deve crescer aos poucos, acompanhando a relação entre os assuntos.

## Escopo atual

Hoje, o projeto está focado na preparação para entrevistas técnicas e live coding, com conteúdos de estruturas de dados, algoritmos e padrões de resolução de problemas.

- Um roadmap organizado por níveis e prioridade para orientar os estudos.
- Conteúdo de teoria e tópicos de preparação para entrevistas.
- Um laboratório visual de grafos, com execução passo a passo de algoritmos como BFS e DFS.
- Acompanhamento do progresso de estudo, salvo localmente.

## Direção do projeto

A estrutura atual é o primeiro ramo de uma árvore maior. A expansão poderá incluir áreas como:

- **Algoritmos:** padrões, estratégias e estruturas de dados conectados entre si.
- **Grafos:** modelagem, percursos, caminhos mínimos e outros problemas relacionados.
- **Redes:** fundamentos, protocolos, segurança e sistemas distribuídos.
- **Hardware e arquitetura:** eletrônica, lógica digital, processadores e sistemas embarcados.
- **Sistemas e software:** sistemas operacionais, programação, compiladores e engenharia de software.

Os ramos poderão se dividir em nós menores, com ligações que indiquem o que se relaciona e o que vale estudar antes. Assim, o projeto poderá avançar de um roadmap de live coding para um mapa mais amplo da Engenharia de Computação.

## Executar localmente

Requer Node.js 22 ou superior.

```bash
npm install
npm run dev
```

O Vite informa no terminal o endereço local da aplicação. Para rodar a suíte de testes, gerar o build ou verificar o código:

```bash
npm test
npm run build
npm run lint
```

## Tecnologias

React, TypeScript, Vite e Tailwind CSS. O servidor opcional usa Node.js e SQLite para armazenar o progresso localmente.

## Estrutura do projeto

- `src/content/roadmap.ts`: catálogo do roadmap de live coding e entrevistas.
- `src/algorithms/`: implementações e conteúdo dos algoritmos.
- `src/simulation/`: motor que gera os passos das visualizações.
- `src/features/`: telas do roadmap, tópicos e laboratório.
- `server/`: API local e persistência com SQLite.

O roadmap de entrevistas também está detalhado em [`Roadmap_Live_Coding_Entrevistas.md`](Roadmap_Live_Coding_Entrevistas.md).
