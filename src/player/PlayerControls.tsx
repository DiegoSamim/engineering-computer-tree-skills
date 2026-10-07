import type { PlayerApi, PlaybackSpeed } from './types';

const SPEEDS: PlaybackSpeed[] = [0.5, 1, 1.5, 2];

function IconButton({
  onClick,
  disabled,
  label,
  children,
}: {
  onClick: () => void;
  disabled?: boolean;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      title={label}
      className="flex h-8 w-8 items-center justify-center border border-line text-sm text-ink transition-colors hover:border-line-strong hover:bg-surface-sunken disabled:cursor-not-allowed disabled:opacity-35 disabled:hover:bg-transparent"
    >
      {children}
    </button>
  );
}

export function PlayerControls({ player }: { player: PlayerApi }) {
  const { stepIndex, playing, speed, maxIndex } = player;

  return (
    <div className="flex flex-wrap items-center gap-4 border-t border-line px-4 py-2.5">
      <div className="flex items-center gap-1.5">
        <IconButton label="Ir para o início" onClick={player.toStart} disabled={stepIndex === 0}>
          |◀
        </IconButton>
        <IconButton label="Passo anterior" onClick={player.prev} disabled={stepIndex === 0}>
          ◀
        </IconButton>
        <IconButton label={playing ? 'Pausar' : 'Executar'} onClick={player.toggle}>
          {playing ? '❚❚' : '▶'}
        </IconButton>
        <IconButton label="Próximo passo" onClick={player.next} disabled={stepIndex >= maxIndex}>
          ▶
        </IconButton>
        <IconButton label="Ir para o resultado" onClick={player.toEnd} disabled={stepIndex >= maxIndex}>
          ▶|
        </IconButton>
      </div>

      <div className="flex items-center gap-1 border-l border-line pl-4">
        {SPEEDS.map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => player.setSpeed(s)}
            className="px-1.5 py-0.5 font-mono-num text-[11px] transition-colors"
            style={
              speed === s
                ? { background: 'var(--color-accent)', color: 'var(--color-on-accent)' }
                : { color: 'var(--text-muted)' }
            }
          >
            {s}x
          </button>
        ))}
      </div>

      <div className="ml-auto font-mono-num text-[12px] text-ink-muted">
        Passo {maxIndex === 0 ? 0 : stepIndex} de {maxIndex}
      </div>
    </div>
  );
}
