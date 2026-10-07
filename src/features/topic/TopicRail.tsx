import { MASTERY_DIMENSIONS, MASTERY_LABELS } from '../../content/mastery';
import { TOPIC_SECTIONS, type TopicContent } from '../../content/topics/types';
import { SIGNALS } from '../../content/signals';
import { useProgress, useTopicProgress } from '../../store/useProgress';
import type { TopicStatus } from '../../data/types';

const STATUS_OPTIONS: { value: TopicStatus; label: string }[] = [
  { value: 'nao-iniciado', label: 'Não iniciado' },
  { value: 'em-estudo', label: 'Em estudo' },
  { value: 'concluido', label: 'Concluído' },
];

export function TopicRail({ content }: { content: TopicContent }) {
  const progress = useTopicProgress(content.id);
  const dispatch = useProgress((s) => s.dispatch);

  const masteryDone = MASTERY_DIMENSIONS.filter((d) => progress.mastery[d]).length;
  const signals = SIGNALS.filter((s) => s.topicId === content.id);

  return (
    <aside className="flex w-[300px] shrink-0 flex-col overflow-y-auto border-l border-line" aria-label="Progresso do tópico">
      <section className="border-b border-line px-4 py-3.5">
        <h2 className="mb-2.5 font-mono-num text-[11px] uppercase tracking-wide text-ink-faint">Status</h2>
        <div className="flex border border-line">
          {STATUS_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => void dispatch({ type: 'TOPIC_STATUS_CHANGED', topicId: content.id, status: opt.value })}
              className="flex-1 px-1 py-1.5 text-[11px] font-medium transition-colors"
              style={
                progress.status === opt.value
                  ? { background: 'var(--color-accent)', color: 'var(--color-on-accent)' }
                  : { color: 'var(--text-muted)' }
              }
            >
              {opt.label}
            </button>
          ))}
        </div>
        <div className="mt-3 flex flex-col gap-1 font-mono-num text-[11.5px] text-ink-muted">
          <div className="flex justify-between">
            <span>Seções lidas</span>
            <span className="text-ink">
              {progress.sectionsDone.length} / {TOPIC_SECTIONS.length}
            </span>
          </div>
          <div className="flex justify-between">
            <span>Exercícios feitos</span>
            <span className="text-ink">
              {progress.exercisesDone.length} / {content.exercises.length}
            </span>
          </div>
        </div>
      </section>

      {signals.length > 0 && (
        <section className="border-b border-line px-4 py-3.5">
          <h2 className="mb-2 font-mono-num text-[11px] uppercase tracking-wide text-ink-faint">
            Sinais de que é {content.name}
          </h2>
          <ul className="flex flex-col gap-1.5">
            {signals.map((s) => (
              <li key={s.signal} className="flex gap-2 text-[12px] leading-relaxed text-ink-muted">
                <span aria-hidden="true" style={{ color: 'var(--color-accent)' }}>→</span>
                {s.signal}
              </li>
            ))}
          </ul>
          <p className="mt-2 text-[11px] leading-relaxed text-ink-faint">
            Entrevistas não anunciam o tópico — o que se treina é reconhecer o sinal.
          </p>
        </section>
      )}

      <section className="border-b border-line px-4 py-3.5">
        <div className="mb-2.5 flex items-baseline justify-between">
          <h2 className="font-mono-num text-[11px] uppercase tracking-wide text-ink-faint">Critérios de domínio</h2>
          <span className="font-mono-num text-[11px]" style={{ color: 'var(--color-accent)' }}>
            {masteryDone}/{MASTERY_DIMENSIONS.length}
          </span>
        </div>
        <div className="mb-3 h-[3px] w-full bg-[var(--border)]">
          <div
            className="h-full transition-[width] duration-500"
            style={{
              width: `${(masteryDone / MASTERY_DIMENSIONS.length) * 100}%`,
              background: masteryDone === MASTERY_DIMENSIONS.length ? 'var(--color-success)' : 'var(--color-accent)',
            }}
          />
        </div>
        <ul className="flex flex-col gap-2">
          {MASTERY_DIMENSIONS.map((dim) => {
            const checked = Boolean(progress.mastery[dim]);
            return (
              <li key={dim}>
                <button
                  type="button"
                  onClick={() =>
                    void dispatch({ type: 'MASTERY_TOGGLED', topicId: content.id, dimension: dim, value: !checked })
                  }
                  className="flex w-full gap-2 text-left"
                >
                  <span
                    aria-hidden="true"
                    className="mt-[1px] flex h-3.5 w-3.5 shrink-0 items-center justify-center border text-[9px]"
                    style={{
                      borderColor: checked ? 'var(--color-success)' : 'var(--border-strong)',
                      color: 'var(--color-success)',
                    }}
                  >
                    {checked ? '✓' : ''}
                  </span>
                  <span className="flex flex-col gap-0.5">
                    <span className="text-[12px] font-medium" style={{ color: checked ? 'var(--text)' : 'var(--text-muted)' }}>
                      {MASTERY_LABELS[dim].label}
                    </span>
                    <span className="text-[11px] leading-relaxed text-ink-faint">{content.mastery[dim]}</span>
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      </section>

      <section className="px-4 py-3.5">
        <h2 className="mb-2.5 font-mono-num text-[11px] uppercase tracking-wide text-ink-faint">Exercícios</h2>
        <ul className="flex flex-col gap-2">
          {content.exercises.map((ex) => {
            const done = progress.exercisesDone.includes(ex.id);
            return (
              <li key={ex.id}>
                <button
                  type="button"
                  onClick={() =>
                    void dispatch({ type: 'EXERCISE_MARKED', topicId: content.id, exerciseId: ex.id, done: !done })
                  }
                  className="flex w-full items-start gap-2 text-left"
                >
                  <span
                    aria-hidden="true"
                    className="mt-[1px] flex h-3.5 w-3.5 shrink-0 items-center justify-center border text-[9px]"
                    style={{
                      borderColor: done ? 'var(--color-success)' : 'var(--border-strong)',
                      color: 'var(--color-success)',
                    }}
                  >
                    {done ? '✓' : ''}
                  </span>
                  <span className="flex flex-1 items-baseline justify-between gap-2">
                    <span className="text-[12px]" style={{ color: done ? 'var(--text-faint)' : 'var(--text)' }}>
                      {ex.name}
                    </span>
                    <span className="shrink-0 font-mono-num text-[9.5px] text-ink-faint">{ex.difficulty}</span>
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      </section>
    </aside>
  );
}
