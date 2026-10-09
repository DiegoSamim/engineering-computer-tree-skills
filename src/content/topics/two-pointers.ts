import type { TopicContent } from './types';

export const twoPointers: TopicContent = {
  whatIsIt: [
    'Two Pointers é uma técnica que usa dois índices percorrendo uma estrutura — geralmente um array — de forma coordenada, em vez de testar todas as combinações com laços aninhados.',
    'A variante mais comum é a de extremos opostos: um ponteiro começa no início, outro no fim, e eles se aproximam. A cada passo, uma comparação decide qual dos dois mover. A outra variante é a de mesma direção, em que os dois avançam para a frente em velocidades diferentes.',
    'O ganho não vem de "usar duas variáveis". Vem de cada movimento descartar um bloco inteiro de possibilidades de uma só vez, transformando O(n²) em O(n).',
  ],

  intuition: [
    'Em vez de fixar um elemento e procurar o outro (o que obriga a varrer o resto do array para cada elemento), movemos os dois extremos para dentro guiados por uma comparação.',
    'A pergunta que destrava o padrão é: "se esta combinação não serve, o que mais posso eliminar junto com ela?". Num array ordenado, a resposta costuma ser: uma linha ou coluna inteira da matriz de pares.',
    'Concretamente: se nums[left] + nums[right] é grande demais, então nums[right] — o maior valor ainda disponível — não serve com NENHUM candidato restante, porque todos os outros são maiores ou iguais a nums[left]. Descartar right elimina de uma vez todos os pares que o incluíam.',
  ],

  analogy: {
    title: 'Duas pessoas caminhando de extremos opostos',
    text: 'Imagine duas pessoas em pontas opostas de uma rua, andando uma em direção à outra. A cada passo, elas decidem quem se move com base em uma única informação — por exemplo, se a soma das idades delas passou ou não de um número combinado. Como a rua está ordenada por idade, quem estiver no extremo errado não tem chance com ninguém que restou, e pode sair. Elas nunca refazem o caminho, e por isso percorrem a rua uma única vez entre as duas.',
  },

  whenToUse: [
    'O array está ordenado — ou pode ser ordenado sem quebrar o problema.',
    'O problema pede um par, uma tripla, ou uma relação entre dois elementos (soma, diferença, produto).',
    'Faz sentido trabalhar a partir dos extremos da estrutura.',
    'Existe uma forma clara de eliminar possibilidades a cada comparação.',
    'Subarrays ou janelas contíguas (aí vira Sliding Window, a variante de mesma direção).',
  ],

  whenNotToUse: [
    'O array não está ordenado e ordenar destruiria a informação necessária (por exemplo, quando a resposta precisa dos índices originais e há duplicados ambíguos).',
    'Não existe uma regra que permita descartar um lado com segurança — sem isso, mover um ponteiro pode pular a resposta.',
    'O problema exige examinar todos os pares de fato (como contar todas as combinações que satisfazem algo complexo).',
    'A estrutura não permite movimento por índice, como uma linked list simplesmente encadeada sem acesso aleatório.',
  ],

  complexity: {
    time: 'O(n)',
    timeNote: 'Cada índice é visitado no máximo uma vez: left só cresce, right só diminui, e eles param ao se cruzar. Se o array precisar ser ordenado antes, o custo total passa a ser dominado pelo O(n log n) da ordenação.',
    space: 'O(1)',
    spaceNote: 'Apenas duas variáveis de índice. Nenhuma estrutura auxiliar — é justamente essa a vantagem sobre a solução com Hash Map, que resolve Two Sum em O(n) mas gasta O(n) de memória.',
  },

  examples: [
    {
      title: 'Two Sum II — array ordenado',
      input: 'nums = [1, 2, 3, 4, 6, 8, 9, 11], target = 9',
      walkthrough: [
        'left=0 (1), right=7 (11) → 1 + 11 = 12 > 9. O 11 é o maior valor restante; se ele não cabe nem com o menor, não cabe com ninguém. Move right.',
        'left=0 (1), right=6 (9) → 1 + 9 = 10 > 9. Mesmo raciocínio. Move right.',
        'left=0 (1), right=5 (8) → 1 + 8 = 9 ✓. Resposta: índices 0 e 5.',
        'Três comparações em vez das 28 que o laço aninhado faria.',
      ],
    },
    {
      title: 'Container With Most Water',
      input: 'height = [1, 8, 6, 2, 5, 4, 8, 3, 7]',
      walkthrough: [
        'A área é limitada pela menor das duas alturas, e a largura só diminui.',
        'Mover o ponteiro da barra MAIS ALTA nunca ajuda: a área continua limitada pela mais baixa e a largura encolheu.',
        'Então sempre se move o ponteiro da barra mais baixa — é a única escolha que pode melhorar o resultado.',
        'Esse é o mesmo formato de argumento do Two Sum II: provar que um lado é seguro de descartar.',
      ],
    },
    {
      title: 'Remover duplicados in-place (mesma direção)',
      input: 'nums = [0, 0, 1, 1, 2]',
      walkthrough: [
        'slow marca onde o próximo valor único deve ser escrito; fast varre o array.',
        'Quando nums[fast] difere de nums[slow], avança slow e copia.',
        'Os dois andam para frente — variante de mesma direção, não de extremos opostos.',
      ],
    },
  ],

  template: {
    language: 'typescript',
    code: `// Extremos opostos — o template que precisa sair sem consulta.
function twoSumSorted(nums: number[], target: number): [number, number] | null {
  let left = 0;
  let right = nums.length - 1;

  while (left < right) {           // '<' e não '<=': um elemento não forma par
    const sum = nums[left] + nums[right];

    if (sum === target) return [left, right];

    if (sum > target) {
      right--;                     // o maior valor não serve com ninguém
    } else {
      left++;                      // o menor valor não serve com ninguém
    }
  }

  return null;                     // os ponteiros se cruzaram: não existe par
}

// Mesma direção (fast/slow) — a outra metade do padrão.
function removeDuplicates(nums: number[]): number {
  if (nums.length === 0) return 0;

  let slow = 0;
  for (let fast = 1; fast < nums.length; fast++) {
    if (nums[fast] !== nums[slow]) {
      slow++;
      nums[slow] = nums[fast];
    }
  }
  return slow + 1;
}`,
  },

  commonMistakes: [
    'Aplicar em array não ordenado. Sem a ordenação, mover um ponteiro não elimina nada com segurança — e a resposta pode ser pulada silenciosamente.',
    'Usar while (left <= right) na variante de extremos opostos. Com left === right o mesmo elemento seria somado consigo próprio.',
    'Mover o ponteiro errado. Se a soma passou do alvo, é o right que desce. Inverter isso faz o algoritmo divergir do alvo em vez de convergir.',
    'Mover os dois ponteiros ao mesmo tempo depois de uma comparação. Isso pula pares que ainda não foram testados.',
    'Esquecer de retornar/tratar o caso "não encontrado" quando os ponteiros se cruzam.',
    'Ordenar quando o problema pede os índices ORIGINAIS. Nesse caso, ou guarde os índices antes de ordenar, ou use Hash Map.',
    'Não tratar array vazio ou de um único elemento antes de entrar no laço.',
  ],

  exerciseWhy: {
    'two-sum-ii': 'O caso canônico. Se este não sai sem consulta, o padrão ainda não está automático.',
    'valid-palindrome': 'Extremos opostos sem aritmética — mostra que o padrão não é só sobre somas.',
    'container-most-water': 'Força a articular POR QUE descartar um lado é seguro. É o exercício que treina o argumento de correção.',
    'three-sum': 'Two Pointers dentro de um laço externo, mais o tratamento de duplicados — a extensão natural.',
    'sort-colors': 'Partição com três ponteiros (Dutch National Flag). Amplia o padrão para além de dois índices.',
  },

  summary: [
    'Two Pointers troca laços aninhados por uma única varredura coordenada: O(n²) → O(n), com O(1) de memória.',
    'A pré-condição quase sempre é a ordenação — é ela que torna seguro descartar um lado inteiro.',
    'Duas variantes: extremos opostos (convergem) e mesma direção (fast/slow, base do Sliding Window).',
    'O que se deve saber explicar na entrevista não é o código, é o invariante: por que mover aquele ponteiro nunca descarta a resposta.',
  ],

  review: [
    { question: 'Por que o array precisa estar ordenado?', answer: 'Porque é a ordenação que garante que o valor em um extremo é o maior (ou menor) disponível. Sem isso, descartar esse extremo poderia estar jogando fora a resposta.' },
    { question: 'Se a soma é maior que o alvo, qual ponteiro se move e por quê?', answer: 'O right, para a esquerda. nums[right] é o maior valor restante; como todos os outros candidatos são ≥ nums[left], qualquer par com nums[right] será ≥ à soma atual, que já passou do alvo.' },
    { question: 'Por que while (left < right) e não (left <= right)?', answer: 'Com left === right os dois ponteiros apontam para o mesmo elemento, e somá-lo consigo próprio não forma um par válido.' },
    { question: 'Qual a vantagem sobre a solução com Hash Map?', answer: 'Memória: Two Pointers usa O(1) contra O(n) do Hash Map. Em troca, exige o array ordenado — o Hash Map funciona em array desordenado e preserva os índices originais.' },
    { question: 'Como o padrão muda na variante de mesma direção?', answer: 'Os dois ponteiros andam para frente em velocidades diferentes: slow marca a fronteira do resultado e fast varre. É a base do Sliding Window e de detecção de ciclo em linked list.' },
  ],
};
