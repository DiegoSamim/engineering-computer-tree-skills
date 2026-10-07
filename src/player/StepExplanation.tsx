import type { Narration } from '../simulation/types';

interface Props {
  narration: Narration;
  stepIndex: number;
  maxIndex: number;
}

/** The "what is happening right now" panel, shared by every visualizer. */
export function StepExplanation({ narration, stepIndex, maxIndex }: Props) {
  return (
    <section className="border-b border-line px-4 py-3.5">
      <div className="mb-1.5 font-mono-num text-[11px] uppercase tracking-wide text-ink-faint">
        Passo {stepIndex} de {maxIndex}
      </div>
      <h3 className="mb-1.5 text-[15px] font-semibold leading-snug text-ink">{narration.title}</h3>
      <p className="text-[13px] leading-relaxed text-ink-muted">{narration.text}</p>
    </section>
  );
}
