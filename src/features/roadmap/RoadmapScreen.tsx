import { useState } from 'react';
import { Link } from 'react-router-dom';
import { SECTIONS, PRIORITY_COLOR, PRIORITY_LABEL, topicsOf, type RoadmapSection } from '../../content/roadmap';
import { useTopicProgress } from '../../store/useProgress';
import { TopicCard } from './TopicCard';
import { ProgressAside } from './ProgressAside';
import { useRoadmapProgress } from './useRoadmapProgress';

type ViewMode = 'trilha' | 'lista';

function SectionHeader({ section, done, total }: { section: RoadmapSection; done: number; total: number }) {
  const ratio = total === 0 ? 0 : done / total;
  return (
    <div className="mb-3.5 flex flex-wrap items-baseline gap-x-3 gap-y-1">
      {section.level !== undefined && (
        <span
          className="flex h-6 w-6 shrink-0 items-center justify-center border font-mono-num text-[11px]"
          style={{ borderColor: 'var(--border-strong)', color: 'var(--text-muted)' }}
        >
          {section.level}
        </span>
      )}
      <h2 className="text-[15px] font-semibold tracking-tight text-ink">{section.title}</h2>
      <span className="text-[12px] text-ink-faint">{section.subtitle}</span>
      <div className="ml-auto flex items-center gap-2.5">
        <span className="font-mono-num text-[11px] text-ink-faint">
          {done}/{total}
        </span>
        <div className="h-[3px] w-24 bg-[var(--border)]">
          <div
            className="h-full transition-[width] duration-500"
            style={{ width: `${ratio * 100}%`, background: ratio === 1 ? 'var(--color-success)' : 'var(--color-accent)' }}
          />
        </div>
      </div>
    </div>
  );
}

function TrackRow({ section }: { section: RoadmapSection }) {
  const topics = topicsOf(section.id);
  return (
    <div className="flex flex-wrap items-stretch gap-y-3">
      {topics.map((topic, i) => (
        <div key={topic.id} className="flex items-stretch">
          <TopicCard topic={topic} />
          {i < topics.length - 1 && (
            <span aria-hidden="true" className="flex items-center px-2 text-[13px] text-ink-faint">
              →
            </span>
          )}
        </div>
      ))}
    </div>
  );
}

function ListView() {
  return (
    <div className="border-t border-line">
      {SECTIONS.map((section) => (
        <div key={section.id}>
          <div className="border-b border-line bg-surface-sunken px-5 py-2">
            <span className="font-mono-num text-[11px] uppercase tracking-wide text-ink-faint">
              {section.level !== undefined ? `Nível ${section.level} · ` : 'Paralela · '}
              {section.title}
            </span>
          </div>
          <table className="w-full">
            <tbody>
              {topicsOf(section.id).map((topic) => (
                <ListTableRow key={topic.id} topicId={topic.id} />
              ))}
            </tbody>
          </table>
        </div>
      ))}
    </div>
  );
}

function ListTableRow({ topicId }: { topicId: string }) {
  const progress = useTopicProgress(topicId);
  const topic = SECTIONS.flatMap((s) => topicsOf(s.id)).find((t) => t.id === topicId)!;
  const mark =
    progress.status === 'concluido' ? { g: '✓', c: 'var(--color-success)' }
    : progress.status === 'em-estudo' ? { g: '●', c: 'var(--color-warn)' }
    : { g: '○', c: 'var(--text-faint)' };

  return (
    <tr className="border-b border-line">
      <td className="w-8 py-2 pl-5 align-top text-[12px]" style={{ color: mark.c }}>
        {mark.g}
      </td>
      <td className="py-2 pr-4 align-top">
        {topic.route ? (
          <Link to={topic.route} className="text-[13px] font-medium text-ink transition-colors hover:text-[var(--color-accent)]">
            {topic.name}
          </Link>
        ) : (
          <span className="text-[13px] font-medium text-ink-muted">{topic.name}</span>
        )}
        <div className="mt-0.5 text-[11.5px] leading-relaxed text-ink-faint">{topic.whatToMaster}</div>
      </td>
      <td className="w-24 py-2 pr-5 align-top text-right">
        <span className="font-mono-num text-[9.5px] uppercase tracking-[0.1em]" style={{ color: PRIORITY_COLOR[topic.priority] }}>
          {PRIORITY_LABEL[topic.priority]}
        </span>
      </td>
    </tr>
  );
}

export function RoadmapScreen() {
  const [mode, setMode] = useState<ViewMode>('trilha');
  const stats = useRoadmapProgress();

  const main = SECTIONS.filter((s) => s.kind === 'principal');
  const parallel = SECTIONS.filter((s) => s.kind === 'paralela');

  return (
    <div className="flex h-full">
      <div className="min-w-0 flex-1 overflow-y-auto">
        <header className="flex flex-wrap items-end justify-between gap-4 px-8 pb-6 pt-7">
          <div>
            <h1 className="text-[26px] font-semibold tracking-tight text-ink">Roadmap de Live Coding</h1>
            <p className="mt-1 max-w-[620px] text-[13.5px] leading-relaxed text-ink-muted">
              Profundidade em 15–20 padrões recorrentes vale mais que exposição superficial a dezenas
              de algoritmos avançados. Estude na ordem; as trilhas paralelas rodam desde o começo.
            </p>
          </div>
          <div className="flex border border-line">
            {(['trilha', 'lista'] as ViewMode[]).map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => setMode(m)}
                className="px-3 py-1.5 text-[12px] font-medium capitalize transition-colors"
                style={
                  mode === m
                    ? { background: 'var(--color-accent)', color: 'var(--color-on-accent)' }
                    : { color: 'var(--text-muted)' }
                }
              >
                {m}
              </button>
            ))}
          </div>
        </header>

        {mode === 'lista' ? (
          <ListView />
        ) : (
          <div className="px-8 pb-10">
            {main.map((section) => {
              const s = stats.bySection[section.id];
              return (
                <section key={section.id} className="border-t border-line py-6">
                  <SectionHeader section={section} done={s.done} total={s.total} />
                  <TrackRow section={section} />
                </section>
              );
            })}

            <div className="mt-4 border-t-2 border-dashed border-line pt-6">
              <div className="mb-4">
                <h2 className="text-[13px] font-semibold uppercase tracking-[0.14em] text-ink-muted">
                  Trilhas paralelas
                </h2>
                <p className="mt-1 text-[12px] text-ink-faint">
                  Não são uma fase posterior — começam no primeiro dia e são praticadas em toda questão.
                </p>
              </div>
              {parallel.map((section) => {
                const s = stats.bySection[section.id];
                return (
                  <section key={section.id} className="border-t border-line py-5">
                    <SectionHeader section={section} done={s.done} total={s.total} />
                    <TrackRow section={section} />
                  </section>
                );
              })}
            </div>
          </div>
        )}
      </div>

      <ProgressAside />
    </div>
  );
}
