import type { GraphProblem } from '../../domain/types';
import type { StepEvent } from '../../simulation/events';
import type { SimulationState } from '../../simulation/state';
import type { Narration } from '../../simulation/types';

function list(ids: string[]): string {
  return `[${ids.join(', ')}]`;
}

function fmtFrontier(entries: SimulationState['frontier']): string {
  return list(entries.map((e) => `${e.nodeId}(h=${e.h})`));
}

/** Turns one Greedy Best-First event into pedagogical text. */
export function narrate(
  event: StepEvent,
  _prev: SimulationState,
  next: SimulationState,
  _problem: GraphProblem,
): Narration {
  switch (event.type) {
    case 'INIT':
      return {
        title: 'Iniciando a busca',
        text: `Começamos no estado inicial, ${event.start}. A cada passo, vamos escolher o nó que *parece* mais perto do objetivo — sem olhar quanto já gastamos para chegar até ele.`,
        concept: 'heuristica',
      };

    case 'SELECT_NODE': {
      const reason = event.reason;
      if (reason.kind !== 'min') return { title: event.node, text: '' };
      const chosenValue = reason.candidates.find((c) => c.id === event.node)?.value;
      const others = reason.candidates.filter((c) => c.id !== event.node);
      const text =
        others.length === 0
          ? `A fronteira tem só ${event.node}, com h=${chosenValue}.`
          : `A fronteira ordenada por heurística é ${list(reason.candidates.map((c) => `${c.id}(h=${c.value})`))}. Escolhemos ${event.node} porque tem o menor h(n) — a menor estimativa de distância até o objetivo. O custo já gasto para chegar até aqui não entra nessa conta.`;
      return { title: `Escolhendo ${event.node} (h=${chosenValue})`, text, concept: 'heuristica' };
    }

    case 'GOAL_TEST':
      return event.isGoal
        ? { title: `${event.node} é o objetivo!`, text: `${event.node} tinha h(n)=0 — a heurística já sabia que ele era o objetivo. A busca para aqui.`, concept: 'objetivo' }
        : { title: `${event.node} não é o objetivo`, text: `${event.node} não é o objetivo, apesar de parecer promissor pela heurística.`, concept: 'objetivo' };

    case 'EXPAND_NODE':
      return {
        title: `Expandindo ${event.node}`,
        text:
          event.successors.length > 0
            ? `Sucessores de ${event.node}: ${list(event.successors)}. Vamos calcular h(n) para cada um.`
            : `${event.node} não tem sucessores.`,
        concept: 'sucessor',
      };

    case 'DISCOVER_NODES': {
      const nodes = event.discoveries.map((d) => d.node);
      return {
        title: `Estimando a distância até o objetivo`,
        text: `Para ${list(nodes)}, calculamos h(n): quão perto cada um *parece* estar do objetivo. Essa é só uma estimativa — pode estar errada.`,
        concept: 'heuristica',
      };
    }

    case 'ADD_TO_FRONTIER':
      return {
        title: 'Reordenando pela heurística',
        text: `A fronteira passa a ser ${fmtFrontier(next.frontier)}, sempre ordenada do menor para o maior h(n).`,
        concept: 'fronteira',
      };

    case 'SKIP_NODE':
      return {
        title: `${event.node} já descoberto`,
        text: `${event.node} já havia sido descoberto por outro caminho. Como h(n) não muda dependendo de como chegamos até um nó, não há nada para atualizar — apenas ignoramos esta repetição.`,
        concept: 'visitados',
      };

    case 'DEAD_END':
      return { title: `${event.node}: beco sem saída`, text: `${event.node} não tem sucessores e não é o objetivo. Mesmo tendo parecido promissor, este ramo não leva a nada.` };

    case 'SOLUTION_FOUND':
      return {
        title: 'Solução encontrada',
        text: `Caminho: ${event.path.join(' → ')}. Custo total: ${event.cost}. A Gulosa encontrou uma solução seguindo sempre a heurística — mas nada garante que este seja o caminho mais barato. Ela ignorou completamente o custo acumulado ao longo do caminho.`,
        concept: 'otimalidade',
      };

    case 'FAILURE':
      return { title: 'Nenhuma solução encontrada', text: event.reason };

    default:
      return { title: event.type, text: '' };
  }
}
