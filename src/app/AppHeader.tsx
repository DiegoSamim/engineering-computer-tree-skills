import { Link, useLocation } from 'react-router-dom';
import { useDisplayName } from '../store/useProgress';

function initialsOf(name: string): string {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? '')
    .join('');
}

/**
 * Global header. Present on every screen except onboarding — it is the only
 * chrome that persists across the roadmap, topics and the lab.
 */
export function AppHeader() {
  const name = useDisplayName();
  const { pathname } = useLocation();

  return (
    <header className="flex h-14 shrink-0 items-center gap-6 border-b border-line px-5">
      <Link to="/roadmap" className="flex items-center gap-2.5">
        <span
          className="flex h-7 w-7 items-center justify-center border font-mono-num text-[13px]"
          style={{ borderColor: 'var(--color-accent-border)', color: 'var(--color-accent)' }}
          aria-hidden="true"
        >
          {'</>'}
        </span>
        <span className="flex flex-col leading-tight">
          <span className="text-[13.5px] font-semibold tracking-tight text-ink">Roadmap Live Coding</span>
          <span className="text-[10.5px] text-ink-faint">Prepare hoje. Conquiste amanhã.</span>
        </span>
      </Link>

      <nav className="flex items-center gap-1 text-[12.5px]">
        {[
          { to: '/roadmap', label: 'Roadmap' },
          { to: '/sinais', label: 'Sinais' },
          { to: '/lab/grafos', label: 'Laboratório' },
        ].map((item) => {
          const active = pathname.startsWith(item.to);
          return (
            <Link
              key={item.to}
              to={item.to}
              className="px-2.5 py-1 transition-colors"
              style={{ color: active ? 'var(--color-accent)' : 'var(--text-muted)' }}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>

      {name && (
        <div className="ml-auto flex items-center gap-2.5">
          <span className="text-right text-[12px] leading-tight text-ink-muted">
            Olá, {name.split(/\s+/)[0]}
          </span>
          <span
            className="flex h-7 w-7 items-center justify-center border text-[11px] font-semibold"
            style={{ borderColor: 'var(--border-strong)', color: 'var(--text-muted)' }}
          >
            {initialsOf(name)}
          </span>
        </div>
      )}
    </header>
  );
}
