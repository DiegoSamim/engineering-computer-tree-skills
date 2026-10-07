import type { NodeId } from '../../domain/types';
import type { SimulationState } from '../../simulation/state';

interface Props {
  state: SimulationState;
  nodeId: NodeId;
  onClose: () => void;
}

function explain(state: SimulationState, nodeId: NodeId): string {
  const index = state.frontier.findIndex((e) => e.nodeId === nodeId);
  if (index === -1) {
    return `${nodeId} não está na fronteira agora — ou já foi processado, ou ainda não foi descoberto.`;
  }
  const ahead = state.frontier.slice(0, index);
  const next = state.frontier[0];

  if (index === 0) {
    return `${nodeId} está no topo da fronteira — é ele que será escolhido no próximo passo.`;
  }

  switch (state.frontierKind) {
    case 'queue':
      return `${nodeId} está na posição ${index + 1} da fila. ${ahead.length === 1 ? `${ahead[0].nodeId} está` : `${ahead.map((e) => e.nodeId).join(', ')} estão`} à frente porque ${ahead.length === 1 ? 'entrou' : 'entraram'} na fila antes. Na Busca em Largura (FIFO), quem chega primeiro sai primeiro — o custo da aresta não importa aqui.`;
    case 'stack':
      return `${nodeId} está a ${index} posições do topo. ${next.nodeId} foi descoberto mais recentemente e por isso está no topo da pilha. Na Busca em Profundidade (LIFO), o último nó descoberto é sempre o próximo a ser explorado.`;
    case 'priority': {
      const metricOf = (e: (typeof state.frontier)[number]) => e.f ?? e.h ?? e.g;
      const clicked = state.frontier[index];
      return `${nodeId} tem valor ${metricOf(clicked)}, maior que o de ${next.nodeId} (${metricOf(next)}), que está no topo da fronteira. Esta busca sempre escolhe o menor valor primeiro.`;
    }
    case 'decision-point':
      return `${nodeId} é uma alternativa neste mesmo ponto de decisão, mas ${next.nodeId} será tentado primeiro, na ordem em que os sucessores foram declarados. ${nodeId} só será tentado se ${next.nodeId} (e cada alternativa entre eles) levar a um beco sem saída e for desfeito.`;
    default:
      return `${nodeId} ainda aguarda na fronteira.`;
  }
}

export function WhyNotPanel({ state, nodeId, onClose }: Props) {
  return (
    <section className="border-b px-4 py-3.5" style={{ borderColor: 'var(--color-accent-border, var(--border))', background: 'var(--color-accent-soft)' }}>
      <div className="mb-1.5 flex items-center justify-between">
        <span className="font-mono-num text-[11px] uppercase tracking-wide" style={{ color: 'var(--color-accent-strong)' }}>
          Por que não {nodeId}?
        </span>
        <button
          type="button"
          onClick={onClose}
          aria-label="Fechar"
          className="text-[13px] text-ink-faint hover:text-ink"
        >
          ✕
        </button>
      </div>
      <p className="text-[13px] leading-relaxed" style={{ color: 'var(--color-accent-strong)' }}>
        {explain(state, nodeId)}
      </p>
    </section>
  );
}
