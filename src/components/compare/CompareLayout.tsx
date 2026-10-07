import { useMemo } from 'react';
import { getGraph } from '../../graphs';
import { ALGORITHMS, getAlgorithm, isImplemented } from '../../algorithms/registry';
import { getTrace } from '../../simulation/buildTrace';
import { useSimulation } from '../../store/useSimulation';
import { GraphCanvas } from '../graph/GraphCanvas';
import { PlayerControls } from '../../player/PlayerControls';
import { useSimulationPlayer } from '../../player/useSimulationPlayer';
import { CompareMetricsTable } from './CompareMetricsTable';

const IMPLEMENTED = ALGORITHMS.filter(isImplemented);

function AlgorithmSelect({ value, onChange }: { value: string; onChange: (id: string) => void }) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="border border-line bg-surface px-2 py-1 text-[12.5px] text-ink"
    >
      {IMPLEMENTED.map((a) => (
        <option key={a.id} value={a.id}>
          {a.name}
        </option>
      ))}
    </select>
  );
}

export function CompareLayout() {
  const graphId = useSimulation((s) => s.graphId);
  const algorithmId = useSimulation((s) => s.algorithmId);
  const compareAlgorithmId = useSimulation((s) => s.compareAlgorithmId);
  const setAlgorithm = useSimulation((s) => s.setAlgorithm);
  const setCompareAlgorithm = useSimulation((s) => s.setCompareAlgorithm);
  const stepIndex = useSimulation((s) => s.stepIndex);

  const problem = getGraph(graphId)!;
  const leftAlgorithm = getAlgorithm(algorithmId) ?? IMPLEMENTED[0];
  const rightAlgorithm = getAlgorithm(compareAlgorithmId) ?? IMPLEMENTED[1] ?? IMPLEMENTED[0];

  const leftTrace = useMemo(() => getTrace(problem, leftAlgorithm), [problem, leftAlgorithm]);
  const rightTrace = useMemo(() => getTrace(problem, rightAlgorithm), [problem, rightAlgorithm]);

  const maxIndex = Math.max(leftTrace.steps.length - 1, rightTrace.steps.length - 1);
  const player = useSimulationPlayer(maxIndex);

  const leftIndex = Math.min(stepIndex, leftTrace.steps.length - 1);
  const rightIndex = Math.min(stepIndex, rightTrace.steps.length - 1);
  const leftStep = leftTrace.steps[leftIndex];
  const rightStep = rightTrace.steps[rightIndex];

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center gap-6 border-b border-line px-4 py-2.5">
        <div className="flex items-center gap-2">
          <span className="text-[11.5px] text-ink-faint">Esquerda</span>
          <AlgorithmSelect value={leftAlgorithm.id} onChange={setAlgorithm} />
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[11.5px] text-ink-faint">Direita</span>
          <AlgorithmSelect value={rightAlgorithm.id} onChange={setCompareAlgorithm} />
        </div>
      </div>

      <div className="grid flex-1 grid-cols-2 divide-x divide-line overflow-hidden">
        <div className="flex flex-col overflow-hidden">
          <div className="border-b border-line px-3 py-2 text-[12px] font-medium text-ink">{leftAlgorithm.name}</div>
          <div className="min-h-0 flex-1">
            <GraphCanvas problem={problem} state={leftStep.state} />
          </div>
          <div className="border-t border-line px-3 py-2 text-[11.5px] text-ink-muted">{leftStep.narration.title}</div>
        </div>
        <div className="flex flex-col overflow-hidden">
          <div className="border-b border-line px-3 py-2 text-[12px] font-medium text-ink">{rightAlgorithm.name}</div>
          <div className="min-h-0 flex-1">
            <GraphCanvas problem={problem} state={rightStep.state} />
          </div>
          <div className="border-t border-line px-3 py-2 text-[11.5px] text-ink-muted">{rightStep.narration.title}</div>
        </div>
      </div>

      <PlayerControls player={player} />
      <CompareMetricsTable
        left={{ algorithm: leftAlgorithm, state: leftStep.state, summary: leftTrace.summary }}
        right={{ algorithm: rightAlgorithm, state: rightStep.state, summary: rightTrace.summary }}
      />
    </div>
  );
}
