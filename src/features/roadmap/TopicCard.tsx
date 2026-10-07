import { Link } from 'react-router-dom';
import { PRIORITY_COLOR, PRIORITY_LABEL, type RoadmapTopic } from '../../content/roadmap';
import { useTopicProgress } from '../../store/useProgress';
import type { TopicStatus } from '../../data/types';

const STATUS_MARK: Record<TopicStatus, { glyph: string; color: string; label: string }> = {
  concluido: { glyph: '✓', color: 'var(--color-success)', label: 'Concluído' },
  'em-estudo': { glyph: '●', color: 'var(--color-warn)', label: 'Em estudo' },
  'nao-iniciado': { glyph: '○', color: 'var(--text-faint)', label: 'Não iniciado' },
};

export function TopicCard({ topic }: { topic: RoadmapTopic }) {
  const progress = useTopicProgress(topic.id);
  const mark = STATUS_MARK[progress.status];
  const available = Boolean(topic.route);

  const body = (
    <>
      <div className="mb-2 flex items-start justify-between gap-2">
        <span className="text-[13px] font-medium leading-snug text-ink">{topic.name}</span>
        <span aria-hidden="true" className="shrink-0 text-[12px]" style={{ color: mark.color }}>
          {mark.glyph}
        </span>
      </div>
      <div className="mt-auto flex items-center gap-2">
        <span
          className="font-mono-num text-[9.5px] uppercase tracking-[0.1em]"
          style={{ color: PRIORITY_COLOR[topic.priority] }}
        >
          {PRIORITY_LABEL[topic.priority]}
        </span>
        <span className="text-[10px] text-ink-faint">· {mark.label}</span>
      </div>
      {!available && (
        <span className="mt-2 block text-[10px] text-ink-faint opacity-0 transition-opacity group-hover:opacity-100">
          conteúdo em breve
        </span>
      )}
    </>
  );

  const className =
    'group flex min-h-[96px] w-[190px] shrink-0 flex-col border p-3 text-left transition-colors';
  const style = {
    borderColor: progress.status === 'nao-iniciado' ? 'var(--border)' : 'var(--border-strong)',
    background: 'var(--bg-raised)',
  };

  if (!available) {
    return (
      <div className={`${className} cursor-default opacity-70`} style={style} title="Conteúdo em breve">
        {body}
      </div>
    );
  }

  return (
    <Link
      to={topic.route!}
      className={className}
      style={{ ...style, borderColor: 'var(--border-strong)' }}
      onMouseEnter={(e) => (e.currentTarget.style.borderColor = 'var(--color-accent)')}
      onMouseLeave={(e) => (e.currentTarget.style.borderColor = 'var(--border-strong)')}
    >
      {body}
    </Link>
  );
}
