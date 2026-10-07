import { useEffect, useRef } from 'react';
import type { PlayableTrace, PlayerApi } from './types';

interface Props {
  trace: PlayableTrace;
  player: PlayerApi;
}

/** Clickable execution history. Knows nothing beyond each step's title. */
export function Timeline({ trace, player }: Props) {
  const { stepIndex, setStepIndex } = player;
  const activeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    activeRef.current?.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
  }, [stepIndex]);

  return (
    <div className="flex gap-1 overflow-x-auto border-t border-line px-4 py-2" aria-label="Linha do tempo de execução">
      {trace.steps.map((step, i) => {
        const active = i === stepIndex;
        return (
          <button
            key={i}
            ref={active ? activeRef : undefined}
            type="button"
            onClick={() => setStepIndex(i)}
            title={step.narration.title}
            className="flex shrink-0 flex-col items-start gap-0.5 border px-2 py-1 text-left transition-colors"
            style={
              active
                ? { borderColor: 'var(--color-accent)', background: 'var(--color-accent-soft)' }
                : { borderColor: 'var(--border)' }
            }
          >
            <span className="font-mono-num text-[10px] text-ink-faint">{i}</span>
            <span className="max-w-[92px] truncate text-[11px] text-ink">{step.narration.title}</span>
          </button>
        );
      })}
    </div>
  );
}
