import { ALGORITHMS, isImplemented } from '../../algorithms/registry';
import { GRAPHS, PLANNED_EXAMPLES } from '../../graphs';
import { useSimulation } from '../../store/useSimulation';

export function Sidebar() {
  const algorithmId = useSimulation((s) => s.algorithmId);
  const graphId = useSimulation((s) => s.graphId);
  const setAlgorithm = useSimulation((s) => s.setAlgorithm);
  const setGraph = useSimulation((s) => s.setGraph);

  return (
    <nav className="flex h-full flex-col overflow-y-auto border-r border-line" aria-label="Algoritmos e exemplos">
      <div className="px-4 pb-1 pt-4">
        <h2 className="font-mono-num text-[11px] uppercase tracking-wide text-ink-faint">Algoritmos</h2>
      </div>
      <ul>
        {ALGORITHMS.map((algorithm) => {
          const active = algorithm.id === algorithmId;
          const implemented = isImplemented(algorithm);
          return (
            <li key={algorithm.id} className="border-t border-line first:border-t-0">
              <button
                type="button"
                disabled={!implemented}
                onClick={() => setAlgorithm(algorithm.id)}
                className={`block w-full border-l-2 px-4 py-2.5 text-left transition-colors disabled:cursor-not-allowed ${
                  active ? '' : 'border-transparent hover:bg-surface-sunken'
                }`}
                style={active ? { borderColor: 'var(--color-accent)', background: 'var(--color-accent-soft)' } : undefined}
              >
                <div className="flex items-center justify-between gap-2">
                  <span
                    className={`text-[13px] ${active ? 'font-semibold' : 'font-medium'}`}
                    style={{ color: active ? 'var(--color-accent-strong)' : 'var(--text)' }}
                  >
                    {algorithm.name}
                  </span>
                  {!implemented && (
                    <span className="shrink-0 font-mono-num text-[9.5px] uppercase tracking-wide text-ink-faint">
                      em breve
                    </span>
                  )}
                </div>
                <p className="mt-0.5 text-[11.5px] leading-snug text-ink-faint">{algorithm.shortSummary}</p>
              </button>
            </li>
          );
        })}
      </ul>

      <div className="border-t border-line px-4 pb-1 pt-4">
        <h2 className="font-mono-num text-[11px] uppercase tracking-wide text-ink-faint">Exemplos</h2>
      </div>
      <ul className="pb-4">
        {GRAPHS.map((graph) => {
          const active = graph.id === graphId;
          return (
            <li key={graph.id} className="border-t border-line first:border-t-0">
              <button
                type="button"
                onClick={() => setGraph(graph.id)}
                className={`block w-full border-l-2 px-4 py-2.5 text-left transition-colors ${
                  active ? '' : 'border-transparent hover:bg-surface-sunken'
                }`}
                style={active ? { borderColor: 'var(--color-accent)', background: 'var(--color-accent-soft)' } : undefined}
              >
                <span
                  className={`text-[13px] ${active ? 'font-semibold' : 'font-medium'}`}
                  style={{ color: active ? 'var(--color-accent-strong)' : 'var(--text)' }}
                >
                  {graph.name}
                </span>
                <p className="mt-0.5 text-[11.5px] leading-snug text-ink-faint">{graph.teachingPoint}</p>
              </button>
            </li>
          );
        })}
        {PLANNED_EXAMPLES.map((label) => (
          <li key={label} className="border-t border-line px-4 py-2.5 text-[13px] text-ink-faint" aria-disabled="true">
            {label}
            <span className="ml-2 font-mono-num text-[9.5px] uppercase tracking-wide">em breve</span>
          </li>
        ))}
      </ul>
    </nav>
  );
}
