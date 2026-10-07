import { useEffect } from 'react';
import type { PlayerApi } from './types';

const BASE_STEP_MS = 900;

/**
 * Drives automatic playback for any PlayerApi. Deliberately dumb: it only
 * calls next() on a timer — the exact same transition a manual click would
 * cause. Autoplay is never a different code path from manual stepping.
 */
export function useAutoAdvance(player: PlayerApi): void {
  const { playing, speed, stepIndex, maxIndex, next, toggle } = player;

  useEffect(() => {
    if (!playing) return;
    if (stepIndex >= maxIndex) {
      toggle();
      return;
    }
    const id = window.setTimeout(next, BASE_STEP_MS / speed);
    return () => window.clearTimeout(id);
  }, [playing, speed, stepIndex, maxIndex, next, toggle]);
}
