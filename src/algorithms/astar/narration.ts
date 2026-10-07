import type { GraphProblem } from '../../domain/types';
import { heuristicOf } from '../../domain/graph';
import type { StepEvent } from '../../simulation/events';
import type { SimulationState } from '../../simulation/state';
import type { Narration } from '../../simulation/types';

function list(ids: string[]): string {
  return `[${ids.join(', ')}]`;
}

function fmtFrontier(entries: SimulationState['frontier']): string {
  return list(entries.map((e) => `${e.nodeId}(f=${e.f})`));
}

/** Turns one A* event into pedagogical text, always tying f back to g + h. */
export function narrate(
  event: StepEvent,
  _prev: SimulationState,
  next: SimulationState,
  problem: GraphProblem,
): Narration {
  switch (event.type) {
    case 'INIT':
      return {
        title: 'Iniciando a busca',
        text: `Começamos em ${event.start}, com f(${event.start}) = g + h = 0 + ${heuristicOf(problem, event.start)}. A cada passo escolhemos o menor f(n): o que já gastamos somado ao que estimamos faltar.`,
        concept: 'funcao-avaliacao',
      };

    case 'SELECT_NODE': {
      const reason = event.reason;
      if (reason.kind !== 'min') return { title: event.node, text: '' };

      const entry = next.frontier.find((e) => e.nodeId === event.node);
      const chosen = reason.candidates.find((c) => c.id === event.node)?.value;
      const g = entry?.g;
      const h = heuristicOf(problem, event.node);
      const others = reason.candidates.filter((c) => c.id !== event.node);

      const breakdown = g !== undefined ? ` f(${event.node}) = g + h = ${g} + ${h} = ${chosen}.` : '';
      const text =
        others.length === 0
          ? `A fronteira tem só ${event.node}.${breakdown}`
          : `A fronteira ordenada por f é ${list(reason.candidates.map((c) => `${c.id}(f=${c.value})`))}. Escolhemos ${event.node} porque tem o menor f(n).${breakdown} Nem o mais barato até aqui, nem o que parece mais perto: o melhor equilíbrio entre os dois.`;

      return { title: `Escolhendo ${event.node} (f=${chosen})`, text, concept: 'funcao-avaliacao' };
    }

    case 'GOAL_TEST':
      return event.isGoal
        ? {
            title: `${event.node} é o objetivo!`,
            text: `${event.node} foi retirado com o menor f da fronteira. Como h é admissível — nunca superestima o que falta — nenhum caminho ainda na fronteira pode ser mais barato que este. Por isso a solução é ótima.`,
            concept: 'otimalidade',
          }
        : { title: `${event.node} não é o objetivo`, text: `${event.node} não é o objetivo. Vamos expandi-lo.`, concept: 'objetivo' };

    case 'EXPAND_NODE':
      return {
        title: `Expandindo ${event.node}`,
        text:
          event.successors.length > 0
            ? `Sucessores de ${event.node}: ${list(event.successors)}. Para cada um calculamos g(n) somando o custo da aresta, e f(n) somando a heurística.`
            : `${event.node} não tem sucessores.`,
        concept: 'sucessor',
      };

    case 'DISCOVER_NODES': {
      const parts = event.discoveries.map((d) => {
        const h = heuristicOf(problem, d.node);
        return `${d.node}: f = ${d.g} + ${h} = ${d.g + h}`;
      });
      return {
        title: 'Calculando f(n) = g(n) + h(n)',
        text: parts.join(' · ') + '.',
        concept: 'funcao-avaliacao',
      };
    }

    case 'ADD_TO_FRONTIER':
      return {
        title: 'Reordenando por f(n)',
        text: `A fronteira passa a ser ${fmtFrontier(next.frontier)}, do menor para o maior f.`,
        concept: 'fronteira',
      };

    case 'UPDATE_FRONTIER':
      return {
        title: 'Caminho melhor encontrado',
        text: `Chegamos a um nó já conhecido por um caminho mais barato: g caiu, e f caiu junto. A fronteira reordenada é ${fmtFrontier(next.frontier)}. Como o teste de objetivo só acontece ao retirar da fronteira, essa correção ainda chega a tempo de mudar a resposta.`,
        concept: 'custo-acumulado',
      };

    case 'SKIP_NODE':
      return {
        title: `${event.node}: caminho pior descartado`,
        text: `Já existe um caminho até ${event.node} com g menor. Como h(${event.node}) é o mesmo nos dois casos, este caminho também teria f maior — não há por que guardá-lo.`,
        concept: 'poda',
      };

    case 'DEAD_END':
      return { title: `${event.node}: beco sem saída`, text: `${event.node} não tem sucessores e não é o objetivo.` };

    case 'SOLUTION_FOUND':
      return {
        title: 'Solução encontrada',
        text: `Caminho: ${event.path.join(' → ')}. Custo total: ${event.cost}. O A* chegou ao mesmo caminho ótimo do Custo Uniforme, mas expandindo bem menos nós — a heurística serviu para evitar ramos inúteis, não para aceitar uma resposta pior.`,
        concept: 'otimalidade',
      };

    case 'FAILURE':
      return { title: 'Nenhuma solução encontrada', text: event.reason };

    default:
      return { title: event.type, text: '' };
  }
}
