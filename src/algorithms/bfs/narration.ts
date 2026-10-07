import type { GraphProblem } from '../../domain/types';
import type { StepEvent } from '../../simulation/events';
import type { SimulationState } from '../../simulation/state';
import type { Narration } from '../../simulation/types';

function list(ids: string[]): string {
  return `[${ids.join(', ')}]`;
}

/**
 * Turns one BFS event into pedagogical text. Kept separate from run.ts so
 * the algorithm's logic stays readable and the prose stays easy to edit
 * without touching the traversal code.
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
        text: `Começamos no estado inicial, ${event.start}. Ele entra na fronteira — o conjunto de nós já descobertos, mas ainda não totalmente explorados.`,
        concept: 'estado-inicial',
      };

    case 'SELECT_NODE': {
      const reason = event.reason;
      const queueBefore = reason.kind === 'fifo' ? reason.queueBefore : [event.node];
      const rest = queueBefore.slice(1);
      const text =
        queueBefore.length === 1
          ? `A fila contém apenas ${event.node}. Ele é retirado para ser expandido.`
          : `A fila é ${list(queueBefore)}. Retiramos o primeiro elemento, ${event.node} — os demais, ${list(rest)}, continuam esperando. Isso é FIFO: First In, First Out, o primeiro a entrar é o primeiro a sair.`;
      return { title: `Retirando ${event.node} da fila`, text, concept: 'fila' };
    }

    case 'EXPAND_NODE': {
      const text =
        event.successors.length > 0
          ? `${event.node} não é o objetivo, então examinamos seus sucessores: ${list(event.successors)}. Expandir um nó significa examiná-lo e gerar seus sucessores.`
          : `${event.node} não possui sucessores — não há para onde avançar a partir daqui.`;
      return { title: `Expandindo ${event.node}`, text, concept: 'expandir' };
    }

    case 'DISCOVER_NODES': {
      const nodes = event.discoveries.map((d) => d.node);
      return {
        title: nodes.length > 1 ? `Descobrindo ${list(nodes)}` : `Descobrindo ${nodes[0]}`,
        text: `${list(nodes)} ${nodes.length > 1 ? 'estão' : 'está'} a uma aresta de distância do nó que acabamos de expandir. Um nó "descoberto" já foi gerado como sucessor, mas ainda não foi processado.`,
        concept: 'sucessor',
      };
    }

    case 'ADD_TO_FRONTIER': {
      const before = prev.frontier.map((e) => e.nodeId);
      const after = next.frontier.map((e) => e.nodeId);
      return {
        title: 'Adicionando à fila',
        text: `A fila passa de ${list(before)} para ${list(after)}. Na Busca em Largura, novos nós entram sempre no final da fila — a ordem de chegada é o que decide a prioridade, não o custo da aresta.`,
        concept: 'fronteira',
      };
    }

    case 'SKIP_NODE':
      return {
        title: `${event.node} já descoberto`,
        text: `${event.node} já havia sido descoberto por outro caminho. Ignoramos esta repetição para não processar o mesmo nó duas vezes.`,
        concept: 'visitados',
      };

    case 'GOAL_TEST':
      return event.isGoal
        ? {
            title: `${event.node} é o objetivo!`,
            text: `${event.node} acabou de ser descoberto e é exatamente o que procurávamos. A busca pode parar aqui.`,
            concept: 'objetivo',
          }
        : { title: `${event.node} não é o objetivo`, text: `Verificamos: ${event.node} não é o objetivo. A busca continua.`, concept: 'objetivo' };

    case 'SOLUTION_FOUND':
      return {
        title: 'Solução encontrada',
        text: `Caminho: ${event.path.join(' → ')}. Custo total: ${event.cost}. Como a Busca em Largura explora por profundidade crescente, este é o caminho com menos arestas — mas não necessariamente o de menor custo.`,
        concept: 'caminho-solucao',
      };

    case 'FAILURE':
      return { title: 'Nenhuma solução encontrada', text: event.reason };

    default:
      return { title: event.type, text: '' };
  }
}
