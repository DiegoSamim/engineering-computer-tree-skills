import type { AlgorithmDefinition } from '../../simulation/types';
import type { SimulationState } from '../../simulation/state';
import type { TraceSummary } from '../../simulation/types';

interface Side {
  algorithm: AlgorithmDefinition;
  state: SimulationState;
  summary: TraceSummary;
}

interface Props {
  left: Side;
  right: Side;
}

function fmtBool(v: boolean | undefined): string {
  if (v === undefined) return '—';
  return v ? 'Sim' : 'Não';
}

const ROWS: { label: string; value: (s: Side) => React.ReactNode }[] = [
  { label: 'Nós descobertos', value: (s) => s.state.metrics.discovered },
  { label: 'Nós expandidos', value: (s) => s.state.metrics.expanded },
  { label: 'Maior fronteira', value: (s) => s.state.metrics.maxFrontierSize },
  { label: 'Profundidade da solução', value: (s) => (s.summary.solutionPath ? s.summary.solutionPath.length - 1 : '—') },
  { label: 'Custo da solução', value: (s) => s.summary.cost ?? '—' },
  { label: 'Encontrou solução?', value: (s) => fmtBool(s.summary.found) },
  { label: 'Solução ótima?', value: (s) => fmtBool(s.summary.isOptimal) },
  { label: 'Algoritmo completo?', value: (s) => s.algorithm.theory.complete },
];

export function CompareMetricsTable({ left, right }: Props) {
  return (
    <div className="border-t border-line px-4 py-4">
      <div className="mb-2 font-mono-num text-[11px] uppercase tracking-wide text-ink-faint">Comparação</div>
      <table className="w-full border-collapse text-[12.5px]">
        <thead>
          <tr className="border-b border-line text-left">
            <th className="py-1.5 font-normal text-ink-faint"> </th>
            <th className="py-1.5 font-semibold text-ink">{left.algorithm.name}</th>
            <th className="py-1.5 font-semibold text-ink">{right.algorithm.name}</th>
          </tr>
        </thead>
        <tbody>
          {ROWS.map((row) => (
            <tr key={row.label} className="border-b border-line last:border-b-0">
              <td className="py-1.5 pr-3 text-ink-muted">{row.label}</td>
              <td className="py-1.5 pr-3 font-mono-num text-ink">{row.value(left)}</td>
              <td className="py-1.5 font-mono-num text-ink">{row.value(right)}</td>
            </tr>
          ))}
        </tbody>
      </table>
      {left.summary.solutionPath && right.summary.solutionPath && (
        <div className="mt-3 space-y-1 font-mono-num text-[12px]">
          <div>
            <span className="text-ink-faint">{left.algorithm.name}: </span>
            <span className="text-ink">{left.summary.solutionPath.join(' → ')}</span>
          </div>
          <div>
            <span className="text-ink-faint">{right.algorithm.name}: </span>
            <span className="text-ink">{right.summary.solutionPath.join(' → ')}</span>
          </div>
        </div>
      )}
    </div>
  );
}
