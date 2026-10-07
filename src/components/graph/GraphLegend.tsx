import type { NodeVisualState } from '../../domain/types';
import { NODE_STYLES } from './visualEncoding';

const ENTRIES: { state: NodeVisualState; label: string }[] = [
  { state: 'default', label: 'Não descoberto' },
  { state: 'discovered', label: 'Descoberto' },
  { state: 'frontier', label: 'Na fronteira' },
  { state: 'current', label: 'Atual' },
  { state: 'expanded', label: 'Expandido' },
  { state: 'solution', label: 'Caminho solução' },
  { state: 'discarded', label: 'Descartado' },
  { state: 'dead-end', label: 'Beco sem saída' },
];

export function GraphLegend() {
  return (
    <div className="flex flex-wrap items-center gap-x-5 gap-y-2 border-t border-line px-4 py-2.5 text-[11px] text-ink-muted">
      {ENTRIES.map(({ state, label }) => {
        const style = NODE_STYLES[state];
        return (
          <div key={state} className="flex items-center gap-1.5">
            <svg width="14" height="14" viewBox="0 0 14 14" aria-hidden="true">
              <circle
                cx="7"
                cy="7"
                r="5.5"
                fill={style.fill}
                stroke={style.stroke}
                strokeWidth={style.strokeWidth * 0.7}
                strokeDasharray={style.dash}
                opacity={style.opacity ?? 1}
              />
            </svg>
            <span>{label}</span>
          </div>
        );
      })}
    </div>
  );
}
