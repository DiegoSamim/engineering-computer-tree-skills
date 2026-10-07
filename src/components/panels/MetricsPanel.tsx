import type { SimulationState } from '../../simulation/state';
import type { TraceSummary } from '../../simulation/types';

interface Props {
  state: SimulationState;
  summary: TraceSummary;
}

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-baseline justify-between py-0.5">
      <span className="text-[12px] text-ink-muted">{label}</span>
      <span className="font-mono-num text-[12.5px] text-ink">{value}</span>
    </div>
  );
}

export function MetricsPanel({ state, summary }: Props) {
  const finished = state.status !== 'running';

  return (
    <section className="border-b border-line px-4 py-3.5">
      <div className="mb-2 font-mono-num text-[11px] uppercase tracking-wide text-ink-faint">Métricas</div>

      <Row label="Visitados" value={state.metrics.discovered} />
      <Row label="Expandidos" value={state.metrics.expanded} />
      <Row label="Fronteira" value={state.metrics.frontierSize} />
      <Row label="Maior fronteira" value={state.metrics.maxFrontierSize} />
      <Row label="Profundidade atual" value={state.depth} />
      <Row label="Custo atual" value={state.totalCost} />

      {finished && (
        <div className="mt-3 border-t border-line pt-3">
          <div
            className="mb-1.5 text-[12.5px] font-semibold"
            style={{ color: state.status === 'solved' ? 'var(--color-state-solution)' : 'var(--color-state-danger)' }}
          >
            {state.status === 'solved' ? 'Resultado encontrado' : 'Nenhuma solução encontrada'}
          </div>
          {state.status === 'solved' && summary.solutionPath && (
            <>
              <div className="mb-1.5 font-mono-num text-[12.5px] text-ink">{summary.solutionPath.join(' → ')}</div>
              <Row label="Passos (arestas)" value={summary.pathEdges} />
              <Row label="Custo" value={summary.cost} />
              <Row
                label="Solução ótima?"
                value={summary.isOptimal === undefined ? '—' : summary.isOptimal ? 'Sim' : `Não (ótimo: ${summary.optimalCost})`}
              />
            </>
          )}
        </div>
      )}
    </section>
  );
}
