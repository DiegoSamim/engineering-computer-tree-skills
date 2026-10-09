import type { TopicContent } from './types';

export const algoritmos: TopicContent = {
  whatIsIt: [
    'Um algoritmo é uma sequência finita de passos, sem ambiguidade, que transforma uma entrada numa saída. Uma receita, as instruções de um móvel e um programa são algoritmos; o que muda é quem executa.',
    'Todo problema de programação tem três partes: a entrada (o que você recebe), a saída (o que precisa devolver) e o processamento (o caminho de uma até a outra). Antes de escrever código, as três precisam estar claras.',
    'Decompor é quebrar o processamento em partes menores até que cada parte seja óbvia de escrever. "Calcular a média da turma" é grande demais; "começar a soma em zero" cabe numa linha. O trabalho de programar é, em boa parte, chegar nesse nível.',
  ],

  intuition: [
    'O computador não interpreta intenção: ele faz exatamente o que está escrito, na ordem escrita. "Some as notas" parece claro para uma pessoa, mas esconde perguntas: começar de onde? Somar quantas? Guardar onde? Um bom algoritmo responde todas elas.',
    'A pergunta que guia a decomposição é: "este passo eu já sei escrever?". Se sim, ele está pronto. Se não, ele ainda é um problema, e vale perguntar de novo quais são a entrada, a saída e o processamento dele.',
    'Comece pelas pontas. Definir a saída cedo evita resolver o problema errado; definir a entrada cedo revela os casos difíceis (lista vazia, número negativo, texto em vez de número). O meio fica mais fácil quando as pontas estão firmes.',
  ],

  analogy: {
    title: 'Instruções para quem nunca entrou na sua cozinha',
    text: 'Imagine explicar por telefone como fazer café para alguém que nunca esteve na sua casa. "Faz um café" não funciona. Você precisa dizer onde está o pó, quanto usar, quanta água, por quanto tempo esperar e onde servir. Cada instrução vaga vira uma pergunta, e a pessoa só consegue seguir se cada passo for pequeno e preciso. O computador é esse ajudante: obediente, rápido e sem nenhum contexto.',
  },

  whenToUse: [
    'Sempre antes de abrir o editor, mesmo em problemas que parecem simples: dois minutos de decomposição economizam vinte de depuração.',
    'Quando o enunciado é longo e mistura várias exigências: separe cada uma num passo.',
    'Quando você trava no meio do código: volte para a decomposição e veja qual passo ainda está grande demais.',
    'Em entrevista técnica: falar a decomposição em voz alta mostra raciocínio antes da primeira linha de código.',
    'Quando o mesmo trecho aparece duas vezes: é sinal de um subproblema que merece um nome (vira uma função mais adiante).',
  ],
  whenNotToUse: [
    'Decompor sem ter entendido entrada e saída: os passos ficam certos para o problema errado.',
    'Quebrar demais, até passos triviais ("abrir os olhos, ler a primeira letra"): a decomposição para quando o passo já é óbvio de escrever.',
    'Ficar só no papel: depois de decompor, teste com uma entrada de verdade, passo a passo.',
    'Pular a decomposição porque "já vi um parecido": problemas parecidos costumam ter uma diferença na entrada ou na saída.',
  ],

  complexity: {
    time: 'O(n)',
    timeNote: 'Contar passos é o começo da análise de algoritmos. A média da turma soma cada nota uma vez: com n notas, são n somas, mais uma divisão e uma comparação. O número de passos cresce na mesma proporção da entrada, o que se escreve O(n). Big-O vem com mais calma na branch de Complexidade.',
    space: 'O(1)',
    spaceNote: 'Além da própria entrada, o algoritmo só guarda a soma, a média e a situação: três variáveis, não importa se a turma tem 4 ou 400 alunos. Memória extra constante se escreve O(1).',
  },

  examples: [
    {
      title: 'Média da turma',
      input: 'notas = [7, 9, 6, 8], aprovação com média ≥ 7',
      walkthrough: [
        'Entrada: uma lista de notas. Saída: a média e "Aprovada" ou "Reprovada".',
        'Processamento: somar todas as notas → dividir pela quantidade → comparar com 7.',
        '"Somar todas as notas" ainda esconde uma repetição: começar a soma em 0 e, para cada nota, somar à soma.',
        'Executando: 0 → 7 → 16 → 22 → 30. Média = 30 ÷ 4 = 7,5. Como 7,5 ≥ 7, a saída é "7,5 · Aprovada".',
      ],
    },
    {
      title: 'O maior de três números',
      input: 'a = 4, b = 9, c = 2',
      walkthrough: [
        'Entrada: três números. Saída: o maior deles.',
        'Processamento: guardar a como "maior até agora" → se b for maior, guardar b → se c for maior, guardar c.',
        'Executando: maior = 4 → 9 > 4, maior = 9 → 2 < 9, mantém. Saída: 9.',
        'O mesmo passo ("se for maior, guardar") se repete: com uma lista de números, ele vira uma repetição.',
      ],
    },
    {
      title: 'Troco com o menor número de cédulas',
      input: 'valor = 576, cédulas de 100, 50, 20, 10, 5, 2 e 1',
      walkthrough: [
        'Entrada: um valor inteiro. Saída: quantas cédulas de cada tipo, usando o mínimo possível.',
        'Processamento: para cada cédula, da maior para a menor, quantas cabem no valor → descontar do valor.',
        'Executando: 5 de 100 (sobra 76) → 1 de 50 (26) → 1 de 20 (6) → 0 de 10 → 1 de 5 (1) → 0 de 2 → 1 de 1 (0).',
        'Cada passo usa só divisão inteira e resto. A decomposição transformou um problema "esperto" em contas simples.',
      ],
    },
  ],

  template: {
    language: 'typescript',
    code: `// Entrada → processamento → saída, com um nome para cada parte.

function somar(notas: number[]): number {
  let soma = 0;                     // toda soma acumulada começa em zero
  for (const nota of notas) {
    soma = soma + nota;             // o mesmo passo, uma vez por nota
  }
  return soma;
}

function media(notas: number[]): number {
  if (notas.length === 0) return 0; // caso de borda: turma vazia
  return somar(notas) / notas.length;
}

function situacao(m: number): string {
  if (m >= 7) return 'Aprovada';
  return 'Reprovada';
}

// Saída: exatamente o que o enunciado pede.
const notas = [7, 9, 6, 8];
const m = media(notas);
console.log(m, situacao(m));        // 7.5 'Aprovada'`,
  },

  commonMistakes: [
    'Começar a codar sem saber qual é a saída. O programa fica pronto e responde outra pergunta.',
    'Esquecer de inicializar: somar numa variável que não começou em zero (ou contar num contador que não começou em zero).',
    'Dividir por um número fixo ("÷ 4") em vez da quantidade real: o algoritmo só funciona para um caso.',
    'Ignorar a entrada vazia ou inválida: lista sem notas, número negativo, texto onde se esperava número.',
    'Passos ambíguos como "processar os dados" ou "ajustar o valor": se o passo não diz o que fazer, ele ainda não está decomposto.',
    'Inverter a ordem de passos que dependem um do outro: calcular a média antes de terminar a soma.',
    'Testar só com o exemplo do enunciado: escolha também um caso pequeno, um caso de borda e um caso em que a resposta muda.',
  ],

  exerciseWhy: {
    'media-1':
      'Entrada, processamento e saída no menor tamanho possível. Escreva os três antes do código, mesmo que pareça óbvio.',
    'o-maior':
      'Força a decompor uma decisão: compare dois, depois o resultado com o terceiro. Mostra que um passo grande vira dois pequenos.',
    cedulas: 'O exemplo do troco: um processamento que se repete para cada cédula. Decomponha antes e o código sai quase sozinho.',
    'idade-em-dias':
      'O caminho inverso do troco: de dias para anos, meses e dias. Bom para conferir se a decomposição anterior ficou entendida.',
    'notas-e-moedas':
      'O troco com centavos: a entrada muda de inteiro para decimal e o algoritmo precisa de um passo a mais. Descubra qual antes de codar.',
  },

  summary: [
    'Um algoritmo é uma sequência finita de passos, sem ambiguidade, que leva uma entrada a uma saída.',
    'Antes do código: defina a saída, depois a entrada (com os casos difíceis), por último o processamento.',
    'Decompor é quebrar o processamento até cada passo ser óbvio de escrever. Passo que ainda gera dúvida ainda é um problema.',
    'Depois de decompor, execute à mão com uma entrada de verdade. É assim que se acha passo faltando, como a soma que não começou em zero.',
  ],

  review: [
    {
      question: 'Quais são as três partes de todo problema de programação?',
      answer: 'Entrada (o que você recebe), processamento (o caminho) e saída (o que precisa devolver). As três precisam estar claras antes do código.',
    },
    {
      question: 'Por que definir a saída antes do processamento?',
      answer: 'Porque é ela que diz qual problema você está resolvendo. Sem a saída clara, é fácil escrever passos corretos que respondem outra pergunta.',
    },
    {
      question: 'Como saber se um passo já está decomposto o bastante?',
      answer: 'Quando você já sabe escrever aquele passo sem dúvida. Se ele ainda gera perguntas ("somar a partir de onde?"), ele ainda é um subproblema.',
    },
    {
      question: 'O que dá errado se a soma não começar em zero?',
      answer: 'A variável carrega um valor que não é da entrada (lixo ou o resultado de uma execução anterior), e a média sai errada mesmo com todos os outros passos certos.',
    },
    {
      question: 'Por que dividir pela quantidade de notas, e não por 4?',
      answer: 'Porque o algoritmo precisa servir para qualquer entrada. Um número fixo só funciona para turmas de 4 alunos, e uma turma vazia exige um cuidado à parte.',
    },
  ],
};
