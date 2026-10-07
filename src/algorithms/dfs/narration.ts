import type { GraphProblem } from '../../domain/types';
import type { StepEvent } from '../../simulation/events';
import type { SimulationState } from '../../simulation/state';
import type { Narration } from '../../simulation/types';

function list(ids: string[]): string {
  return `[${ids.join(', ')}]`;
}

/**
 * Turns one DFS event into pedagogical text. Kept separate from run.ts so
 * the traversal logic and the prose can evolve independently.
 */
export function narrate(
  event: StepEvent,
  prev: SimulationState,
  next: SimulationState,
  _problem: GraphProblem,
): Narration {
  switch (event.type) {
    case 'INIT':
      return {
        title: 'Iniciando a busca',
        text: `Começamos no estado inicial, ${event.start}. Ele entra na pilha — vamos mergulhar o mais fundo possível antes de voltar e tentar outro ramo.`,
        concept: 'estado-inicial',
      };

    case 'SELECT_NODE': {
      const reason = event.reason;
      const stackBefore = reason.kind === 'lifo' ? reason.stackBefore : [event.node];
      const rest = stackBefore.slice(1);
      const text =
        stackBefore.length === 1
          ? `A pilha contém apenas ${event.node}. Ele é retirado do topo.`
          : `O topo da pilha é ${event.node}, com ${list(rest)} logo abaixo. Retiramos o topo — isso é LIFO: Last In, First Out, o último a entrar é o primeiro a sair.`;
      return { title: `Retirando ${event.node} do topo da pilha`, text, concept: 'pilha' };
    }

    case 'GOAL_TEST':
      return event.isGoal
        ? {
            title: `${event.node} é o objetivo!`,
            text: `Ao expandir ${event.node}, verificamos: é o objetivo. A busca para aqui.`,
            concept: 'objetivo',
          }
        : { title: `${event.node} não é o objetivo`, text: `Verificamos ${event.node}: não é o objetivo. Vamos expandi-lo e continuar aprofundando.`, concept: 'objetivo' };

    case 'EXPAND_NODE': {
      const text =
        event.successors.length > 0
          ? `Geramos os sucessores de ${event.node}: ${list(event.successors)}. O primeiro deles vai para o topo da pilha e será explorado a seguir, antes de qualquer nó mais antigo.`
          : `${event.node} não possui sucessores.`;
      return { title: `Expandindo ${event.node}`, text, concept: 'expandir' };
    }

    case 'DISCOVER_NODES': {
      const nodes = event.discoveries.map((d) => d.node);
      return {
        title: nodes.length > 1 ? `Descobrindo ${list(nodes)}` : `Descobrindo ${nodes[0]}`,
        text: `${list(nodes)} ${nodes.length > 1 ? 'são' : 'é'} sucessor${nodes.length > 1 ? 'es' : ''} do nó que acabamos de expandir.`,
        concept: 'sucessor',
      };
    }

    case 'ADD_TO_FRONTIER': {
      const before = prev.frontier.map((e) => e.nodeId);
      const after = next.frontier.map((e) => e.nodeId);
      return {
        title: 'Empilhando',
        text: `A pilha passa de ${list(before)} para ${list(after)}. O nó mais recém-descoberto fica no topo — é ele que será explorado no próximo passo, não os que já esperavam.`,
        concept: 'pilha',
      };
    }

    case 'SKIP_NODE':
      return {
        title: `${event.node} já descoberto`,
        text: `${event.node} já havia sido descoberto por outro caminho. Ignoramos esta repetição.`,
        concept: 'visitados',
      };

    case 'DEAD_END':
      return {
        title: `${event.node}: beco sem saída`,
        text: `${event.node} não tem sucessores não-visitados e não é o objetivo. Este ramo termina aqui — será preciso voltar (fazer backtracking) e tentar outra alternativa.`,
        concept: 'backtracking',
      };

    case 'BACKTRACK':
      return {
        title: `Retornando de ${event.from}`,
        text: `${event.from} não levou a lugar nenhum. Desfazemos essa escolha e retornamos para ${event.to}, para tentar uma alternativa a partir dali. Backtracking é isso: desfazer uma decisão que não funcionou e experimentar outro caminho.`,
        concept: 'backtracking',
      };

    case 'SOLUTION_FOUND':
      return {
        title: 'Solução encontrada',
        text: `Caminho: ${event.path.join(' → ')}. Custo total: ${event.cost}. A Busca em Profundidade encontrou esta solução por ter mergulhado no primeiro ramo até o fim — não necessariamente o caminho mais barato ou mais curto.`,
        concept: 'caminho-solucao',
      };

    case 'FAILURE':
      return { title: 'Nenhuma solução encontrada', text: event.reason };

    default:
      return { title: event.type, text: '' };
  }
}
