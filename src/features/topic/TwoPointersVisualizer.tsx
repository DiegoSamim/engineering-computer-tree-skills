import { useMemo, useState } from 'react';
import { buildTwoPointersTrace } from '../../visualizers/twoPointers/run';
import { TwoPointersCanvas } from '../../visualizers/twoPointers/TwoPointersCanvas';
import { usePlayer } from '../../player/usePlayer';
import { PlayerControls } from '../../player/PlayerControls';
import { Timeline } from '../../player/Timeline';
import { StepExplanation } from '../../player/StepExplanation';

const PRESETS = [
  { label: 'Two Sum II', nums: [1, 2, 3, 4, 6, 8, 9, 11], target: 9 },
  { label: 'Alvo nos extremos', nums: [2, 3, 5, 7, 8, 14], target: 16 },
  { label: 'Sem solução', nums: [1, 2, 3, 4], target: 100 },
];

/**
 * Reusa exatamente o mesmo player do laboratório de grafos — controles,
 * timeline e painel de explicação. A única coisa específica deste tópico é
 * o canvas e o gerador de passos.
 */
export function TwoPointersVisualizer() {
  const [presetIndex, setPresetIndex] = useState(0);
  const preset = PRESETS[presetIndex];

  const trace = useMemo(() => buildTwoPointersTrace(preset.nums, preset.target), [preset]);
  const player = usePlayer(trace.steps.length - 1);
  const step = trace.steps[Math.min(player.stepIndex, trace.steps.length - 1)];

  return (
    <div className="max-w-[860px] border border-line" style={{ background: 'var(--bg-raised)' }}>
      <div className="flex flex-wrap items-center gap-2 border-b border-line px-4 py-2.5">
        <span className="font-mono-num text-[11px] uppercase tracking-wide text-ink-faint">Exemplo</span>
        {PRESETS.map((p, i) => (
          <button
            key={p.label}
            type="button"
            onClick={() => {
              setPresetIndex(i);
              player.toStart();
            }}
            className="border px-2.5 py-1 text-[11.5px] transition-colors"
            style={
              i === presetIndex
                ? { borderColor: 'var(--color-accent)', color: 'var(--color-accent)', background: 'var(--color-accent-soft)' }
                : { borderColor: 'var(--border)', color: 'var(--text-muted)' }
            }
          >
            {p.label}
          </button>
        ))}
      </div>

      <TwoPointersCanvas nums={trace.nums} target={trace.target} state={step.state} />

      <div className="border-t border-line">
        <StepExplanation narration={step.narration} stepIndex={player.stepIndex} maxIndex={player.maxIndex} />
      </div>

      <Timeline trace={trace} player={player} />
      <PlayerControls player={player} />
    </div>
  );
}
