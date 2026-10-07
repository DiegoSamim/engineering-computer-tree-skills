import type { GraphProblem } from '../../domain/types';
import type { StepEvent } from '../../simulation/events';
import type { SimulationState } from '../../simulation/state';
import type { Narration } from '../../simulation/types';

function list(ids: string[]): string {
  return `[${ids.join(', ')}]`;
}

/**
 * Turns one irrevocable-search event into pedagogical text. This search has
 * no frontier and no memory — every narration reinforces that once a
 * choice is made, it is final.
 */
export function narrate(
  event: StepEvent,
  _prev: SimulationState,
  _next: SimulationState,
  _problem: GraphProblem,
): Narration {
  switch (event.type) {
    case 'INIT':
      return {
        title: 'Iniciando a busca',
        text: `Começamos no estado inicial, ${event.start}. Esta busca não mantém fronteira nem histórico — a cada passo, ela se compromete com uma única escolha e nunca a reconsidera.`,
        concept: 'estado-inicial',
      };

    case 'ADD_TO_FRONTIER':
      return {
        title: 'Sem fronteira',
        text: 'Esta busca não guarda alternativas para depois. A cada nó, ela olha só os sucessores imediatos, escolhe um e segue em frente — sem lista de espera.',
        concept: 'fronteira',
      };

    case 'SELECT_NODE': {
      const reason = event.reason;
      if (reason.kind !== 'min-edge-cost') return { title: event.node, text: '' };
      if (reason.candidates.length === 0) {
        return {
          title: `Partindo de ${event.node}`,
          text: `A busca começa em ${event.node}.`,
        };
      }
      const others = reason.candidates.filter((c) => c.id !== event.node);
      const comparison = others.map((c) => `${c.id} custaria ${c.value}`).join(', ');
      return {
        title: `Comprometendo-se com ${event.node}`,
        text: `Entre os sucessores considerados, ${event.node} tem o menor custo de aresta imediato (${reason.candidates.find((c) => c.id === event.node)?.value}). ${others.length > 0 ? `${comparison}.` : ''} A busca segue para ${event.node} e nunca vai reconsiderar essa decisão — mesmo que ela leve a um beco sem saída.`,
        concept: 'custo-aresta',
      };
    }

    case 'GOAL_TEST':
      return event.isGoal
        ? { title: `${event.node} é o objetivo!`, text: `${event.node} é o objetivo. A busca termina aqui, por sorte de a escolha míope ter dado certo.`, concept: 'objetivo' }
        : { title: `${event.node} não é o objetivo`, text: `${event.node} não é o objetivo — vamos examinar seus sucessores.`, concept: 'objetivo' };

    case 'EXPAND_NODE':
      return event.successors.length > 0
        ? {
            title: `Examinando sucessores de ${event.node}`,
            text: `${event.node} leva a ${list(event.successors)}. A busca vai escolher apenas um, pelo menor custo de aresta — os outros serão descartados para sempre.`,
            concept: 'sucessor',
          }
        : { title: `${event.node} não tem sucessores`, text: `${event.node} é um beco sem saída.` };

    case 'DISCOVER_NODES':
      return {
        title: 'Comparando o custo imediato',
        text: `Cada sucessor tem um custo de aresta diferente a partir daqui. Esta busca olha apenas esse número — nunca o custo acumulado nem o que vem depois.`,
        concept: 'custo-aresta',
      };

    case 'SKIP_NODE':
      return {
        title: `${event.node} descartado`,
        text: `${event.node} não tinha o menor custo de aresta imediato, então nunca será visitado por este caminho. Diferente de outras buscas, aqui não existe "guardar para depois" — a alternativa simplesmente se perde.`,
        concept: 'poda',
      };

    case 'DEAD_END':
      return {
        title: `${event.node}: beco sem saída`,
        text: `${event.node} não tem sucessores e não é o objetivo. Como esta busca nunca reconsidera uma escolha anterior, não há para onde voltar.`,
        concept: 'backtracking',
      };

    case 'SOLUTION_FOUND':
      return {
        title: 'Solução encontrada',
        text: `Caminho: ${event.path.join(' → ')}. Custo total: ${event.cost}. A busca irreversível encontrou uma solução desta vez — mas isso foi sorte da estrutura do grafo, não uma garantia do algoritmo.`,
        concept: 'caminho-solucao',
      };

    case 'FAILURE':
      return {
        title: 'Falhou — apesar de existir solução',
        text: `${event.reason} Note que existe pelo menos um caminho até o objetivo neste grafo — esta busca simplesmente não consegue alcançá-lo, porque nunca reconsidera uma decisão já tomada. Isso é completude: esta busca NÃO é completa.`,
        concept: 'completude',
      };

    default:
      return { title: event.type, text: '' };
  }
}
