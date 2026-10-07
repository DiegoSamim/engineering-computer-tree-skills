import type { ReactNode } from 'react';
import type { TopicContent } from '../../content/topics/types';
import { MENTAL_SCRIPT } from '../../content/signals';
import { TwoPointersVisualizer } from './TwoPointersVisualizer';

interface SectionProps {
  id: string;
  title: string;
  done: boolean;
  onToggleDone: () => void;
  children: ReactNode;
}

export function TopicSection({ id, title, done, onToggleDone, children }: SectionProps) {
  return (
    <section id={`sec-${id}`} data-section={id} className="scroll-mt-4 border-t border-line px-8 py-7">
      <div className="mb-4 flex items-baseline justify-between gap-4">
        <h2 className="text-[17px] font-semibold tracking-tight text-ink">{title}</h2>
        <button
          type="button"
          onClick={onToggleDone}
          className="shrink-0 text-[11px] transition-colors"
          style={{ color: done ? 'var(--color-success)' : 'var(--text-faint)' }}
        >
          {done ? '✓ lida' : 'marcar como lida'}
        </button>
      </div>
      {children}
    </section>
  );
}

export function Paragraphs({ items }: { items: string[] }) {
  return (
    <div className="flex max-w-[720px] flex-col gap-3">
      {items.map((p, i) => (
        <p key={i} className="text-[13.5px] leading-relaxed text-ink-muted">
          {p}
        </p>
      ))}
    </div>
  );
}

export function BulletList({ items, marker, color }: { items: string[]; marker: string; color: string }) {
  return (
    <ul className="flex max-w-[720px] flex-col gap-2">
      {items.map((item, i) => (
        <li key={i} className="flex gap-2.5 text-[13px] leading-relaxed text-ink-muted">
          <span aria-hidden="true" className="shrink-0" style={{ color }}>
            {marker}
          </span>
          {item}
        </li>
      ))}
    </ul>
  );
}

export function AnalogySection({ content }: { content: TopicContent }) {
  return (
    <div
      className="max-w-[720px] border-l-2 px-5 py-4"
      style={{ borderColor: 'var(--color-accent-border)', background: 'var(--bg-raised)' }}
    >
      <h3 className="mb-2 text-[13.5px] font-semibold text-ink">{content.analogy.title}</h3>
      <p className="text-[13.5px] leading-relaxed text-ink-muted">{content.analogy.text}</p>
    </div>
  );
}

export function WhenSection({ content }: { content: TopicContent }) {
  return (
    <div className="grid gap-6 md:grid-cols-2">
      <div>
        <h3 className="mb-2.5 flex items-center gap-2 text-[13px] font-semibold text-ink">
          <span aria-hidden="true" style={{ color: 'var(--color-success)' }}>✓</span> Quando usar
        </h3>
        <BulletList items={content.whenToUse} marker="·" color="var(--color-success)" />
      </div>
      <div>
        <h3 className="mb-2.5 flex items-center gap-2 text-[13px] font-semibold text-ink">
          <span aria-hidden="true" style={{ color: 'var(--color-state-danger)' }}>✕</span> Quando não usar
        </h3>
        <BulletList items={content.whenNotToUse} marker="·" color="var(--color-state-danger)" />
      </div>
    </div>
  );
}

export function ComplexitySection({ content }: { content: TopicContent }) {
  const { complexity } = content;
  return (
    <div className="grid max-w-[720px] gap-5 md:grid-cols-2">
      {[
        { label: 'Tempo', value: complexity.time, note: complexity.timeNote },
        { label: 'Espaço', value: complexity.space, note: complexity.spaceNote },
      ].map((c) => (
        <div key={c.label} className="border border-line p-4" style={{ background: 'var(--bg-raised)' }}>
          <div className="mb-1 font-mono-num text-[11px] uppercase tracking-wide text-ink-faint">{c.label}</div>
          <div className="mb-2 font-mono-num text-[22px] font-semibold" style={{ color: 'var(--color-accent)' }}>
            {c.value}
          </div>
          <p className="text-[12px] leading-relaxed text-ink-faint">{c.note}</p>
        </div>
      ))}
    </div>
  );
}

export function ExamplesSection({ content }: { content: TopicContent }) {
  return (
    <div className="flex max-w-[760px] flex-col gap-5">
      {content.examples.map((ex) => (
        <div key={ex.title} className="border border-line" style={{ background: 'var(--bg-raised)' }}>
          <div className="flex flex-wrap items-baseline justify-between gap-2 border-b border-line px-4 py-2.5">
            <h3 className="text-[13px] font-semibold text-ink">{ex.title}</h3>
            <code className="font-mono-num text-[11.5px] text-ink-faint">{ex.input}</code>
          </div>
          <ol className="flex flex-col gap-2 px-4 py-3.5">
            {ex.walkthrough.map((w, i) => (
              <li key={i} className="flex gap-2.5 text-[12.5px] leading-relaxed text-ink-muted">
                <span className="font-mono-num text-ink-faint">{i + 1}</span>
                {w}
              </li>
            ))}
          </ol>
        </div>
      ))}
    </div>
  );
}

export function CodeSection({ content }: { content: TopicContent }) {
  return (
    <pre className="max-w-[760px] overflow-x-auto border border-line bg-surface-sunken p-4 font-mono-num text-[12.5px] leading-relaxed text-ink-muted">
      {content.template.code}
    </pre>
  );
}

export function ExercisesSection({
  content,
  doneIds,
  onToggle,
}: {
  content: TopicContent;
  doneIds: string[];
  onToggle: (id: string, done: boolean) => void;
}) {
  return (
    <div className="flex max-w-[760px] flex-col">
      {content.exercises.map((ex) => {
        const done = doneIds.includes(ex.id);
        return (
          <div key={ex.id} className="flex gap-3 border-b border-line py-3 first:border-t first:border-line">
            <button
              type="button"
              onClick={() => onToggle(ex.id, !done)}
              aria-label={done ? `Desmarcar ${ex.name}` : `Marcar ${ex.name} como feito`}
              className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center border text-[10px]"
              style={{ borderColor: done ? 'var(--color-success)' : 'var(--border-strong)', color: 'var(--color-success)' }}
            >
              {done ? '✓' : ''}
            </button>
            <div className="flex-1">
              <div className="flex flex-wrap items-baseline gap-2">
                <span className="text-[13px] font-medium text-ink">{ex.name}</span>
                <span className="font-mono-num text-[10px] uppercase tracking-wide text-ink-faint">{ex.difficulty}</span>
              </div>
              <p className="mt-0.5 text-[12px] leading-relaxed text-ink-faint">{ex.why}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export function ReviewSection({ content }: { content: TopicContent }) {
  return (
    <div className="flex max-w-[760px] flex-col gap-2">
      {content.review.map((r) => (
        <details key={r.question} className="border border-line px-4 py-2.5" style={{ background: 'var(--bg-raised)' }}>
          <summary className="cursor-pointer text-[13px] font-medium text-ink">{r.question}</summary>
          <p className="mt-2 text-[12.5px] leading-relaxed text-ink-muted">{r.answer}</p>
        </details>
      ))}
      <details className="mt-3 border border-dashed border-line px-4 py-2.5">
        <summary className="cursor-pointer text-[12.5px] font-medium text-ink-muted">
          Script mental de 7 etapas — vale para qualquer questão
        </summary>
        <ol className="mt-2.5 flex flex-col gap-1.5">
          {MENTAL_SCRIPT.map((s, i) => (
            <li key={s.step} className="flex gap-2 text-[12px] leading-relaxed">
              <span className="font-mono-num text-ink-faint">{i + 1}</span>
              <span>
                <span className="font-medium text-ink">{s.step}.</span>{' '}
                <span className="text-ink-faint">{s.detail}</span>
              </span>
            </li>
          ))}
        </ol>
      </details>
    </div>
  );
}

export function VisualizerSection({ content }: { content: TopicContent }) {
  if (content.visualizer !== 'two-pointers') {
    return <p className="text-[13px] text-ink-faint">Visualização em breve para este tópico.</p>;
  }
  return <TwoPointersVisualizer />;
}
