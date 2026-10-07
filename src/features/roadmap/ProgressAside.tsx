import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useRoadmapProgress } from './useRoadmapProgress';
import { useProgress } from '../../store/useProgress';
import { TOPICS, getTopic } from '../../content/roadmap';
import { MENTAL_SCRIPT } from '../../content/signals';

function Donut({ percent }: { percent: number }) {
  const r = 34;
  const c = 2 * Math.PI * r;
  return (
    <svg viewBox="0 0 80 80" className="h-20 w-20 shrink-0" aria-label={`${percent}% concluído`}>
      <circle cx="40" cy="40" r={r} fill="none" stroke="var(--border)" strokeWidth="7" />
      <circle
        cx="40" cy="40" r={r} fill="none"
        stroke="var(--color-accent)" strokeWidth="7" strokeLinecap="butt"
        strokeDasharray={`${(c * percent) / 100} ${c}`}
        transform="rotate(-90 40 40)"
        style={{ transition: 'stroke-dasharray 600ms ease' }}
      />
      <text x="40" y="38" textAnchor="middle" className="font-mono-num" fontSize="15" fontWeight="600" fill="var(--text)">
        {percent}%
      </text>
      <text x="40" y="50" textAnchor="middle" fontSize="7.5" fill="var(--text-faint)">
        por ROI
      </text>
    </svg>
  );
}

function Row({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className="flex items-center gap-2 text-[12px]">
      <span aria-hidden="true" style={{ color }}>●</span>
      <span className="font-mono-num font-medium text-ink">{value}</span>
      <span className="text-ink-muted">{label}</span>
    </div>
  );
}

export function ProgressAside() {
  const stats = useRoadmapProgress();
  const topics = useProgress((s) => s.snapshot.topics);
  const [open, setOpen] = useState(true);

  const studying = TOPICS.filter((t) => topics[t.id]?.status === 'em-estudo').slice(0, 4);
  const next = TOPICS.filter((t) => (topics[t.id]?.status ?? 'nao-iniciado') === 'nao-iniciado' && t.priority === 'CORE').slice(0, 4);

  if (!open) {
    return (
      <aside className="flex w-11 shrink-0 flex-col items-center border-l border-line pt-4">
        <button
          type="button"
          onClick={() => setOpen(true)}
          aria-label="Expandir painel de progresso"
          title="Expandir painel de progresso"
          className="text-[13px] text-ink-faint transition-colors hover:text-ink"
        >
          ‹
        </button>
        <span className="mt-3 font-mono-num text-[11px] font-semibold" style={{ color: 'var(--color-accent)' }}>
          {stats.roiPercent}%
        </span>
      </aside>
    );
  }

  return (
    <aside className="flex w-[290px] shrink-0 flex-col overflow-y-auto border-l border-line" aria-label="Progresso">
      <section className="border-b border-line px-4 py-4">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="font-mono-num text-[11px] uppercase tracking-wide text-ink-faint">Seu progresso</h2>
          <button
            type="button"
            onClick={() => setOpen(false)}
            aria-label="Recolher painel de progresso"
            className="text-[13px] text-ink-faint transition-colors hover:text-ink"
          >
            ›
          </button>
        </div>
        <div className="flex items-center gap-4">
          <Donut percent={stats.roiPercent} />
          <div className="flex flex-col gap-1.5">
            <Row label="concluídos" value={stats.concluded} color="var(--color-success)" />
            <Row label="em estudo" value={stats.studying} color="var(--color-warn)" />
            <Row label="não iniciados" value={stats.notStarted} color="var(--text-faint)" />
          </div>
        </div>
        <p className="mt-3 text-[11px] leading-relaxed text-ink-faint">
          Ponderado pela distribuição de esforço sugerida — concluir um tópico de cauda longa não vale
          o mesmo que concluir Arrays e Strings.
        </p>
      </section>

      {studying.length > 0 && (
        <section className="border-b border-line px-4 py-3.5">
          <h2 className="mb-2.5 font-mono-num text-[11px] uppercase tracking-wide text-ink-faint">Em estudo</h2>
          <ul className="flex flex-col gap-1.5">
            {studying.map((t) => (
              <li key={t.id} className="text-[12.5px]">
                {t.route ? (
                  <Link to={t.route} className="text-ink transition-colors hover:text-[var(--color-accent)]">
                    {t.name}
                  </Link>
                ) : (
                  <span className="text-ink-muted">{t.name}</span>
                )}
              </li>
            ))}
          </ul>
        </section>
      )}

      <section className="border-b border-line px-4 py-3.5">
        <h2 className="mb-2.5 font-mono-num text-[11px] uppercase tracking-wide text-ink-faint">Próximos (CORE)</h2>
        <ul className="flex flex-col gap-1.5">
          {next.map((t) => (
            <li key={t.id} className="flex items-center justify-between gap-2 text-[12.5px]">
              {t.route ? (
                <Link to={t.route} className="text-ink transition-colors hover:text-[var(--color-accent)]">
                  {t.name}
                </Link>
              ) : (
                <span className="text-ink-muted">{t.name}</span>
              )}
              <span className="shrink-0 font-mono-num text-[9.5px]" style={{ color: 'var(--color-prio-core)' }}>
                CORE
              </span>
            </li>
          ))}
        </ul>
      </section>

      <section className="px-4 py-3.5">
        <h2 className="mb-2.5 font-mono-num text-[11px] uppercase tracking-wide text-ink-faint">
          Script mental · 7 etapas
        </h2>
        <ol className="flex flex-col gap-1.5">
          {MENTAL_SCRIPT.map((s, i) => (
            <li key={s.step} className="flex gap-2 text-[11.5px] leading-relaxed">
              <span className="font-mono-num text-ink-faint">{i + 1}</span>
              <span>
                <span className="font-medium text-ink">{s.step}.</span>{' '}
                <span className="text-ink-faint">{s.detail}</span>
              </span>
            </li>
          ))}
        </ol>
      </section>

      {getTopic('two-pointers') && (
        <div className="px-4 pb-4 text-[11px] text-ink-faint">
          Dica: comece por <Link to="/topico/two-pointers" style={{ color: 'var(--color-accent)' }}>Two Pointers</Link>.
        </div>
      )}
    </aside>
  );
}
