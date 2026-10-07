import type { GraphProblem } from '../../domain/types';
import type { StepEvent } from '../../simulation/events';
import type { SimulationState } from '../../simulation/state';
import type { Narration } from '../../simulation/types';

function list(ids: string[]): string {
  return `[${ids.join(', ')}]`;
}

/**
 * Turns one backtracking event into pedagogical text. The narration leans
 * on "decisão" / "alternativa" vocabulary and repeatedly contrasts this
 * with DFS's global stack — the whole point of implementing it separately.
 */
export function narrate(
  event: StepEvent,
  prev: SimulationState,
  _next: SimulationState,
  _problem: GraphProblem,
): Narration {
  switch (event.type) {
    case 'INIT':
      return {
        title: 'Iniciando a busca',
        text: `Começamos no estado inicial, ${event.start}. A cada nó, vamos construir a solução decisão por decisão: escolher uma alternativa, e se ela não funcionar, desfazê-la e tentar a próxima.`,
        concept: 'estado-inicial',
      };

    case 'SELECT_NODE': {
      const reason = event.reason;
      const remaining = reason.kind === 'first-untried' ? reason.remaining : [event.node];
      const others = remaining.slice(1);
      const text =
        others.length === 0
          ? `Tentamos ${event.node}, a única alternativa deste ponto de decisão.`
          : `Tentamos ${event.node} primeiro. Se não funcionar, ainda restam ${list(others)} para tentar aqui — mas só depois de desfazer esta escolha.`;
      return { title: `Tentando ${event.node}`, text, concept: 'backtracking' };
    }

    case 'GOAL_TEST':
      return event.isGoal
        ? { title: `${event.node} é o objetivo!`, text: `${event.node} é o objetivo — esta sequência de decisões funcionou.`, concept: 'objetivo' }
        : { title: `${event.node} não é o objetivo`, text: `${event.node} não é o objetivo. Vamos ver que decisões ele torna possíveis.`, concept: 'objetivo' };

    case 'EXPAND_NODE':
      return {
        title: `Explorando alternativas a partir de ${event.node}`,
        text:
          event.successors.length > 0
            ? `A partir de ${event.node}, as próximas decisões possíveis são: ${list(event.successors)}.`
            : `${event.node} não abre nenhuma decisão nova.`,
        concept: 'sucessor',
      };

    case 'DISCOVER_NODES': {
      const nodes = event.discoveries.map((d) => d.node);
      return {
        title: `Alternativas em ${prev.currentNode}`,
        text: `Neste ponto de decisão, as alternativas disponíveis são ${list(nodes)}. Diferente da Busca em Profundidade, só vemos as opções daqui — não uma pilha global com tudo que já foi descoberto em outros ramos.`,
        concept: 'sucessor',
      };
    }

    case 'ADD_TO_FRONTIER': {
      const remaining = event.entries.map((e) => e.nodeId);
      return {
        title: 'Alternativas restantes aqui',
        text: `Restam ${list(remaining)} para tentar neste ponto de decisão. Esta lista existe só enquanto estamos neste nó — ao voltar (backtrack), ela desaparece.`,
        concept: 'poda',
      };
    }

    case 'SKIP_NODE':
      return {
        title: `${event.node} ignorado`,
        text: `${event.node} já faz parte do caminho de decisões atual — segui-lo de novo criaria um ciclo, então esta alternativa é descartada.`,
        concept: 'poda',
      };

    case 'DEAD_END':
      return {
        title: `${event.node}: nenhuma alternativa`,
        text: `${event.node} não abre nenhuma decisão nova e não é o objetivo. Esta sequência de escolhas não funcionou — é hora de desfazer (backtrack).`,
        concept: 'backtracking',
      };

    case 'BACKTRACK':
      return {
        title: `Desfazendo ${event.from}`,
        text: `A decisão de ir para ${event.from} não levou ao objetivo. Desfazemos essa escolha e voltamos para ${event.to}, para tentar a próxima alternativa disponível ali.`,
        concept: 'backtracking',
      };

    case 'SOLUTION_FOUND':
      return {
        title: 'Solução encontrada',
        text: `Sequência de decisões: ${event.path.join(' → ')}. Custo total: ${event.cost}. Cada passo foi uma escolha que se manteve — nenhuma precisou ser desfeita a partir daqui.`,
        concept: 'caminho-solucao',
      };

    case 'FAILURE':
      return { title: 'Nenhuma solução encontrada', text: event.reason };

    default:
      return { title: event.type, text: '' };
  }
}
