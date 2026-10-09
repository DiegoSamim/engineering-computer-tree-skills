# Catálogo inicial: áreas e branches

Slugs são permanentes. O id de uma branch é `<area>/<branch>`. Só as branches marcadas com ★ nascem com nós (a partir do roadmap atual); as outras começam vazias e ganham o primeiro nó quando um tópico delas for estudado.

| # | Área (slug) | Nome | Cor | Ícone |
|---|---|---|---|---|
| 01 | `fund` | Fundamentos | `#f5c46b` | capelo |
| 02 | `hw` | Hardware | `#6ee7a8` | chip |
| 03 | `cloud` | Cloud & DevOps | `#b79cff` | nuvem |
| 04 | `dados` | Dados | `#ff9e6b` | cilindro |
| 05 | `seg` | Segurança | `#ff7b8a` | escudo |
| 06 | `sis` | Sistemas | `#6cb6ff` | engrenagem |
| 07 | `dev` | Desenvolvimento | `#4fe0d6` | `</>` |
| 08 | `redes` | Redes | `#c8e66b` | rede |
| 09 | `ia` | Inteligência Artificial | `#f48fe0` | faísca |
| 10 | `es` | Engenharia de Software | `#8ea2ff` | blocos |

## Branches

**01 Fundamentos**: `logica` Lógica de programação ★ · `complexidade` Complexidade e análise ★ · `estruturas` Estruturas de dados ★ · `padroes` Padrões de resolução ★ · `grafos` Grafos e busca ★ · `discreta` Matemática discreta · `prob` Probabilidade, estatística e álgebra linear · `teoria` Teoria da computação

**02 Hardware**: `digital` Lógica digital · `organizacao` Organização de computadores · `cpu` Processadores e CPU · `cache` Memória e hierarquia de cache · `isa` Instruções e Assembly · `paralelismo` Paralelismo e aceleradores · `embarcados` Sistemas embarcados

**03 Cloud & DevOps**: `fund` Fundamentos de Cloud · `aws` AWS · `containers` Containers e Docker · `k8s` Kubernetes · `cicd` CI/CD · `iac` Infraestrutura como código · `sre` Observabilidade e SRE · `serverless` Serverless e cloud-native

**04 Dados**: `modelagem` Modelagem de dados · `sql` Relacionais e SQL · `indexacao` Indexação e otimização · `transacoes` Transações e isolamento · `nosql` NoSQL · `distribuidos` Bancos distribuídos · `pipelines` Pipelines e orquestração · `processamento` Processamento distribuído e streaming · `warehouse` Warehouse, Lakehouse e Analytics

**05 Segurança**: `fund` Fundamentos de segurança · `cripto` Criptografia · `auth` Autenticação e autorização · `app` Segurança de aplicações · `redes` Segurança de redes · `cloud` Segurança em Cloud · `ofensiva` Ofensiva: vulnerabilidades e pentest · `defensiva` Defensiva: detecção e resposta · `devsecops` DevSecOps

**06 Sistemas**: `so` Fundamentos de SO · `linux` Linux e terminal · `processos` Processos, threads e escalonamento · `concorrencia` Concorrência e sincronização · `memoria` Gerenciamento de memória · `arquivos` Sistemas de arquivos · `virtualizacao` Virtualização · `compiladores` Compiladores e interpretadores · `distribuidos` Sistemas distribuídos

**07 Desenvolvimento**: `linguagens` Linguagens e paradigmas · `web` Fundamentos da Web · `frontend` Frontend · `backend` Backend · `apis` APIs e integrações · `mobile` Mobile · `async` Programação assíncrona · `uiux` UI e UX · `jogos` Jogos e computação gráfica

**08 Redes**: `fund` Fundamentos e modelos (OSI, TCP/IP) · `enlace` Enlace e switching · `ip` IP, endereçamento e roteamento · `transporte` Transporte (TCP, UDP, QUIC) · `aplicacao` Aplicação (DNS, HTTP, TLS) · `wireless` Redes sem fio · `proxy` Proxy, balanceamento e CDN

**09 Inteligência Artificial**: `fund` Fundamentos de IA (busca e heurísticas) · `ml` Machine Learning · `dl` Deep Learning · `nlp` Linguagem natural · `visao` Visão computacional · `llm` IA generativa e LLMs · `rag` RAG, embeddings e busca vetorial · `agentes` Agentes · `mlops` MLOps

**10 Engenharia de Software**: `solid` SOLID e Design Patterns · `arquitetura` Arquitetura de software · `sd` System Design · `testes` Testes e qualidade · `refatoracao` Refatoração e Clean Code · `versionamento` Versionamento e colaboração · `requisitos` Requisitos e modelagem · `performance` Performance e profiling

## Casas de temas que se repetem

| Tema | Casa | Aparece como espelho ou requisito em |
|---|---|---|
| Concorrência | `sis/concorrencia` | Hardware (paralelismo), Desenvolvimento (async), Dados (transações) |
| Distribuídos | `sis/distribuidos` | `es/sd`, `dados/distribuidos` |
| Busca vetorial | `ia/rag` | Dados |
| Paradigmas e OO | `dev/linguagens` | `es/solid` (requisito) |
| Hashing | `fund/estruturas` | `dados/indexacao`, `es/sd`, `fund/padroes` |
| Busca em grafos (BFS, A*) | `fund/grafos` | `ia/fund` |

Regras: branch é conceito durável; ferramenta é nó (Docker dentro de Containers, Databricks dentro de Processamento), salvo quando tem 5+ nós próprios (AWS). Branch passou de ~20 nós: divide. Uma área nova é rara; uma branch nova pode nascer com 1 nó.
