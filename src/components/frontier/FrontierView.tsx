import type { SimulationState } from '../../simulation/state';
import { QueueView } from './QueueView';
import { StackView } from './StackView';
import { PriorityView } from './PriorityView';
import { AlternativesView } from './AlternativesView';
import { LimitView } from './LimitView';

interface Props {
  state: SimulationState;
}

const TITLES = {
  queue: 'Fila',
  stack: 'Pilha',
  priority: 'Fronteira por prioridade',
  path: 'Caminho atual',
  'decision-point': 'Alternativas neste ponto',
  'iterative-deepening': 'Limite de f(n)',
} as const;

export function FrontierView({ state }: Props) {
  return (
    <section className="border-b border-line px-4 py-3.5">
      <div className="mb-2.5 font-mono-num text-[11px] uppercase tracking-wide text-ink-faint">
        {TITLES[state.frontierKind]}
      </div>
      {state.frontierKind === 'queue' && <QueueView entries={state.frontier} />}
      {state.frontierKind === 'stack' && <StackView entries={state.frontier} />}
      {state.frontierKind === 'priority' && <PriorityView entries={state.frontier} />}
      {state.frontierKind === 'decision-point' && <AlternativesView entries={state.frontier} />}
      {state.frontierKind === 'iterative-deepening' && <LimitView state={state} />}
      {state.frontierKind === 'path' && (
        <p className="text-[12px] text-ink-faint">
          Caminho atual: {state.currentPath.length > 0 ? state.currentPath.join(' → ') : '—'}. Esta busca não mantém
          fronteira nenhuma.
        </p>
      )}
    </section>
  );
}
