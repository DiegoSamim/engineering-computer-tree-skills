import type { GraphProblem } from '../../domain/types';
import type { StepEvent } from '../../simulation/events';
import type { SimulationState } from '../../simulation/state';
import type { Narration } from '../../simulation/types';

function list(ids: string[]): string {
  return `[${ids.join(', ')}]`;
}

function fmtFrontier(entries: SimulationState['frontier']): string {
  return list(entries.map((e) => `${e.nodeId}(g=${e.g})`));
}

/** Turns one Uniform-Cost Search event into pedagogical text. */
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
        text: `Começamos no estado inicial, ${event.start}, com custo acumulado g(${event.start})=0.`,
        concept: 'custo-acumulado',
      };

    case 'SELECT_NODE': {
      const reason = event.reason;
      if (reason.kind !== 'min') return { title: event.node, text: '' };
      const chosenValue = reason.candidates.find((c) => c.id === event.node)?.value;
      const others = reason.candidates.filter((c) => c.id !== event.node);
      const text =
        others.length === 0
          ? `A fronteira tem só ${event.node}, com g=${chosenValue}. Ele é retirado.`
          : `A fronteira ordenada por custo acumulado é ${list(reason.candidates.map((c) => `${c.id}(g=${c.value})`))}. Retiramos ${event.node}, que tem o menor g(n) — não o mais raso, não o mais recente, o mais barato até aqui.`;
      return { title: `Retirando ${event.node} (g=${chosenValue})`, text, concept: 'custo-acumulado' };
    }

    case 'GOAL_TEST':
      return event.isGoal
        ? {
            title: `${event.node} é o objetivo!`,
            text: `${event.node} foi retirado da fronteira por ter o menor custo acumulado entre todos os candidatos. Como o teste de objetivo só acontece ao retirar da fronteira (não ao descobrir), temos garantia de que este é o caminho mais barato até aqui.`,
            concept: 'otimalidade',
          }
        : { title: `${event.node} não é o objetivo`, text: `${event.node} não é o objetivo. Vamos expandi-lo.`, concept: 'objetivo' };

    case 'EXPAND_NODE':
      return {
        title: `Expandindo ${event.node}`,
        text:
          event.successors.length > 0
            ? `Sucessores de ${event.node}: ${list(event.successors)}. Para cada um, calculamos g(n) = g(${event.node}) + custo da aresta.`
            : `${event.node} não tem sucessores.`,
        concept: 'custo-acumulado',
      };

    case 'DISCOVER_NODES': {
      const nodes = event.discoveries.map((d) => `${d.node}(g=${d.g})`);
      return {
        title: 'Descobrindo com custo acumulado',
        text: `${list(nodes)} — cada um com seu próprio g(n), a soma dos custos de aresta desde o início até ali.`,
        concept: 'custo-acumulado',
      };
    }

    case 'ADD_TO_FRONTIER':
      return {
        title: 'Reordenando a fronteira',
        text: `A fronteira passa a ser ${fmtFrontier(next.frontier)}, sempre ordenada do menor para o maior g(n).`,
        concept: 'fronteira',
      };

    case 'UPDATE_FRONTIER':
      return {
        title: 'Caminho mais barato encontrado',
        text: `Um dos nós já descobertos tinha um caminho mais barato até ele do que o registrado antes. Atualizamos seu g(n) e sua posição na fronteira: agora ela é ${fmtFrontier(next.frontier)}. Isso é o que a Busca em Largura nunca faz — ela nunca reconsidera um custo já registrado.`,
        concept: 'custo-acumulado',
      };

    case 'SKIP_NODE':
      return {
        title: `${event.node}: caminho pior descartado`,
        text: `Já existe um caminho até ${event.node} mais barato do que este. O caminho atual é descartado — só vale a pena atualizar quando o novo custo é menor.`,
        concept: 'poda',
      };

    case 'DEAD_END':
      return { title: `${event.node}: beco sem saída`, text: `${event.node} não tem sucessores e não é o objetivo.` };

    case 'SOLUTION_FOUND':
      return {
        title: 'Solução encontrada',
        text: `Caminho: ${event.path.join(' → ')}. Custo total: ${event.cost}. Como o teste de objetivo só ocorre ao retirar da fronteira, este é garantidamente o caminho de menor custo — a Busca de Custo Uniforme é ótima quando todas as arestas têm custo positivo.`,
        concept: 'otimalidade',
      };

    case 'FAILURE':
      return { title: 'Nenhuma solução encontrada', text: event.reason };

    default:
      return { title: event.type, text: '' };
  }
}
