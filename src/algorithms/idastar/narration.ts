import type { GraphProblem } from '../../domain/types';
import { heuristicOf } from '../../domain/graph';
import type { StepEvent } from '../../simulation/events';
import type { SimulationState } from '../../simulation/state';
import type { Narration } from '../../simulation/types';

function list(ids: string[]): string {
  return `[${ids.join(', ')}]`;
}

/** Turns one IDA* event into text, sempre amarrando f(n) ao limite da rodada. */
export function narrate(
  event: StepEvent,
  prev: SimulationState,
  next: SimulationState,
  problem: GraphProblem,
): Narration {
  const limit = next.extra?.limit;

  switch (event.type) {
    case 'INIT':
      return {
        title: 'Iniciando a busca',
        text: `O IDA* não guarda fronteira: ele repete buscas em profundidade, cada uma com um teto para f(n) = g(n) + h(n). O primeiro teto é h(${event.start}) = ${heuristicOf(problem, event.start)} — o menor valor que a solução poderia ter.`,
        concept: 'funcao-avaliacao',
      };

    case 'ITERATION_START':
      return {
        title: `Nova iteração — limite f ≤ ${event.limit}`,
        text: `Recomeçamos do início, em profundidade, explorando apenas nós com f(n) ≤ ${event.limit}. Tudo que foi visitado antes é esquecido: a memória usada é só o caminho atual, nunca a fronteira inteira.`,
        concept: 'funcao-avaliacao',
      };

    case 'ITERATION_END':
      return event.nextLimit === null
        ? {
            title: `Limite ${event.exhaustedLimit} esgotado`,
            text: 'Nenhum nó ultrapassou o limite, então não existe mais nada para explorar além dele.',
            concept: 'completude',
          }
        : {
            title: `Limite ${event.exhaustedLimit} esgotado → novo limite ${event.nextLimit}`,
            text: `Dentro de f ≤ ${event.exhaustedLimit} não havia solução. O novo teto é ${event.nextLimit}: o MENOR f entre os nós que foram podados. Subir exatamente até ele garante que nenhum valor intermediário de f seja pulado — é isso que mantém a otimalidade.`,
            concept: 'otimalidade',
          };

    case 'SELECT_NODE': {
      const entry = prev.frontier.find((e) => e.nodeId === event.node);
      const f = entry?.f;
      const g = entry?.g;
      const h = heuristicOf(problem, event.node);
      const detail = f !== undefined ? ` f(${event.node}) = ${g} + ${h} = ${f}, dentro do limite ${limit}.` : '';
      return {
        title: `Descendo para ${event.node}`,
        text: `Avançamos em profundidade até ${event.node}.${detail}`,
        concept: 'funcao-avaliacao',
      };
    }

    case 'GOAL_TEST':
      return event.isGoal
        ? {
            title: `${event.node} é o objetivo!`,
            text: `Chegamos ao objetivo dentro do limite f ≤ ${limit}. Como cada iteração anterior descartou todo f menor que este, não existe caminho mais barato — a solução é ótima, com a memória de uma busca em profundidade.`,
            concept: 'otimalidade',
          }
        : { title: `${event.node} não é o objetivo`, text: `${event.node} não é o objetivo. Vamos gerar seus sucessores.`, concept: 'objetivo' };

    case 'EXPAND_NODE':
      return {
        title: `Expandindo ${event.node}`,
        text:
          event.successors.length > 0
            ? `Sucessores de ${event.node}: ${list(event.successors)}. Cada um será testado contra o limite antes de qualquer descida.`
            : `${event.node} não tem sucessores.`,
        concept: 'sucessor',
      };

    case 'DISCOVER_NODES': {
      const parts = event.discoveries.map((d) => {
        const h = heuristicOf(problem, d.node);
        const f = d.g + h;
        return `${d.node}: f = ${d.g} + ${h} = ${f}${limit !== undefined && f > limit ? ' ✕' : ' ✓'}`;
      });
      return {
        title: `Comparando f(n) com o limite ${limit}`,
        text: `${parts.join(' · ')}. Os marcados com ✕ estouram o teto desta rodada e ficam para depois.`,
        concept: 'poda',
      };
    }

    case 'ADD_TO_FRONTIER':
      return {
        title: 'Alternativas dentro do limite',
        text: `Restam ${list(next.frontier.map((e) => `${e.nodeId}(f=${e.f})`))} a considerar neste ponto. O IDA* não mantém isto como fronteira global — é só a lista local desta chamada recursiva.`,
        concept: 'fronteira',
      };

    case 'SKIP_NODE': {
      if (event.reason === 'over-limit') {
        return {
          title: `${event.node} ultrapassa o limite (f=${event.f})`,
          text: `f(${event.node}) = ${event.f} é maior que o limite ${limit} desta iteração, então não descemos por aí agora. Mas o valor fica guardado: o menor f podado vira o limite da próxima rodada, e ${event.node} será explorado então.`,
          concept: 'poda',
        };
      }
      return {
        title: `${event.node} ignorado`,
        text: `${event.node} já está no caminho atual — segui-lo criaria um ciclo.`,
        concept: 'poda',
      };
    }

    case 'DEAD_END':
      return {
        title: `${event.node}: beco sem saída`,
        text: `${event.node} não tem sucessores e não é o objetivo. Voltamos.`,
        concept: 'backtracking',
      };

    case 'BACKTRACK':
      return {
        title: `Voltando de ${event.from}`,
        text: `A subárvore de ${event.from} se esgotou dentro do limite ${limit}. Desfazemos a descida e voltamos para ${event.to} — e a memória usada por aquele ramo é liberada junto.`,
        concept: 'backtracking',
      };

    case 'SOLUTION_FOUND':
      return {
        title: 'Solução encontrada',
        text: `Caminho: ${event.path.join(' → ')}. Custo total: ${event.cost}. Mesmo resultado ótimo do A*, mas guardando apenas o caminho atual em vez da fronteira inteira.`,
        concept: 'otimalidade',
      };

    case 'FAILURE':
      return { title: 'Nenhuma solução encontrada', text: event.reason };

    default:
      return { title: event.type, text: '' };
  }
}
