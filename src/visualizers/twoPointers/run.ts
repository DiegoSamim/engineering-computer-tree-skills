import type { Narration } from '../../simulation/types';

export interface TwoPointersState {
  left: number;
  right: number;
  sum?: number;
  /** Índices já descartados, à esquerda de `left` ou à direita de `right`. */
  discardedLeft: number;
  discardedRight: number;
  found?: [number, number];
  status: 'running' | 'found' | 'exhausted';
}

export interface TwoPointersStep {
  state: TwoPointersState;
  narration: Narration;
}

export interface TwoPointersTrace {
  nums: number[];
  target: number;
  steps: TwoPointersStep[];
}

/**
 * Two Pointers de extremos opostos sobre um array ordenado (Two Sum II).
 *
 * Segue a mesma disciplina dos algoritmos de grafo: cada passo é uma decisão
 * pedagogicamente atômica — comparar é um passo, mover é outro — para que o
 * usuário nunca veja duas decisões acontecerem na mesma animação.
 */
export function buildTwoPointersTrace(nums: number[], target: number): TwoPointersTrace {
  const steps: TwoPointersStep[] = [];
  let left = 0;
  let right = nums.length - 1;

  const push = (state: TwoPointersState, narration: Narration) => steps.push({ state, narration });

  push(
    { left, right, discardedLeft: 0, discardedRight: 0, status: 'running' },
    {
      title: 'Posicionando os ponteiros',
      text: `O array está ordenado, então colocamos left no início (índice 0, valor ${nums[left]}) e right no fim (índice ${right}, valor ${nums[right]}). O alvo é ${target}.`,
      concept: 'two-pointers',
    },
  );

  while (left < right) {
    const sum = nums[left] + nums[right];

    if (sum === target) {
      push(
        { left, right, sum, discardedLeft: left, discardedRight: nums.length - 1 - right, status: 'running' },
        {
          title: `${nums[left]} + ${nums[right]} = ${sum}`,
          text: `A soma é exatamente o alvo. Encontramos o par nos índices ${left} e ${right}.`,
          concept: 'two-pointers',
        },
      );
      push(
        { left, right, sum, discardedLeft: left, discardedRight: nums.length - 1 - right, found: [left, right], status: 'found' },
        {
          title: 'Par encontrado',
          text: `Resposta: índices ${left} e ${right} (valores ${nums[left]} e ${nums[right]}). Cada índice foi visitado no máximo uma vez, então o custo é O(n) de tempo e O(1) de espaço — sem nenhuma estrutura auxiliar.`,
          concept: 'complexidade',
        },
      );
      return { nums, target, steps };
    }

    const tooBig = sum > target;
    push(
      { left, right, sum, discardedLeft: left, discardedRight: nums.length - 1 - right, status: 'running' },
      {
        title: `${nums[left]} + ${nums[right]} = ${sum}`,
        text: tooBig
          ? `${sum} é maior que o alvo ${target}. Como o array está ordenado, ${nums[right]} é o maior valor ainda disponível: qualquer par que o inclua será igual ou maior que este. Então nenhum par com ${nums[right]} serve.`
          : `${sum} é menor que o alvo ${target}. Como o array está ordenado, ${nums[left]} é o menor valor disponível: qualquer par que o inclua será igual ou menor que este. Então nenhum par com ${nums[left]} serve.`,
        concept: 'invariante',
      },
    );

    if (tooBig) {
      const from = right;
      right -= 1;
      push(
        { left, right, discardedLeft: left, discardedRight: nums.length - 1 - right, status: 'running' },
        {
          title: 'Movendo right para a esquerda',
          text: `Descartamos o índice ${from} de uma vez — e com ele todos os pares que o incluíam. É isso que substitui o laço aninhado: cada movimento elimina várias possibilidades, não apenas uma.`,
          concept: 'poda',
        },
      );
    } else {
      const from = left;
      left += 1;
      push(
        { left, right, discardedLeft: left, discardedRight: nums.length - 1 - right, status: 'running' },
        {
          title: 'Movendo left para a direita',
          text: `Descartamos o índice ${from} de uma vez — e com ele todos os pares que o incluíam. É isso que substitui o laço aninhado: cada movimento elimina várias possibilidades, não apenas uma.`,
          concept: 'poda',
        },
      );
    }
  }

  push(
    { left, right, discardedLeft: left, discardedRight: nums.length - 1 - right, status: 'exhausted' },
    {
      title: 'Ponteiros se encontraram',
      text: `left e right se cruzaram sem que nenhuma soma desse ${target}. Todo o espaço de pares foi eliminado, então não existe solução — e sabemos disso sem ter testado todos os pares explicitamente.`,
      concept: 'completude',
    },
  );

  return { nums, target, steps };
}
