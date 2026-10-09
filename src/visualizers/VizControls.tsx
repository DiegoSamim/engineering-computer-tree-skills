import type { PlayerApi } from '../player/types';
import { Icon } from '../ui/Icon';

/** Controles dos visualizadores: reiniciar, anterior, reproduzir, próximo, barra e "n / total". */
export function VizControls({ player }: { player: PlayerApi }) {
  return (
    <div className="ctrl">
      <button type="button" className="ic" aria-label="Reiniciar" onClick={player.toStart}>
        <Icon name="reset" />
      </button>
      <button type="button" className="ic" aria-label="Passo anterior" onClick={player.prev}>
        <Icon name="left" />
      </button>
      <button type="button" className="ic" aria-label={player.playing ? 'Pausar' : 'Reproduzir'} onClick={player.toggle}>
        <Icon name={player.playing ? 'pause' : 'play'} />
      </button>
      <button type="button" className="ic" aria-label="Próximo passo" onClick={player.next}>
        <Icon name="right" />
      </button>
      <div className="scrub" aria-hidden="true">
        <i style={{ width: `${(player.stepIndex / Math.max(1, player.maxIndex)) * 100}%` }} />
      </div>
      <span className="stepn">
        {player.stepIndex + 1} / {player.maxIndex + 1}
      </span>
    </div>
  );
}
