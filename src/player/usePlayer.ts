import { useCallback, useMemo, useState } from 'react';
import { useAutoAdvance } from './useAutoAdvance';
import type { PlayerApi, PlaybackSpeed } from './types';

/**
 * Self-contained playback state for a single visualizer instance. Used by
 * everything except the graph lab, which has its own global store and uses
 * `useSimulationPlayer` instead.
 */
export function usePlayer(maxIndex: number): PlayerApi {
  const [stepIndex, setIndex] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [speed, setSpeed] = useState<PlaybackSpeed>(1);

  const clamped = Math.min(stepIndex, Math.max(maxIndex, 0));

  const setStepIndex = useCallback((i: number) => {
    setIndex(Math.max(0, i));
    setPlaying(false);
  }, []);

  const next = useCallback(() => {
    setIndex((i) => Math.min(i + 1, maxIndex));
  }, [maxIndex]);

  const prev = useCallback(() => {
    setIndex((i) => Math.max(0, i - 1));
    setPlaying(false);
  }, []);

  const toStart = useCallback(() => {
    setIndex(0);
    setPlaying(false);
  }, []);

  const toEnd = useCallback(() => {
    setIndex(maxIndex);
    setPlaying(false);
  }, [maxIndex]);

  const toggle = useCallback(() => {
    setPlaying((p) => {
      if (p) return false;
      // Pressing play at the very end restarts from the beginning.
      setIndex((i) => (i >= maxIndex ? 0 : i));
      return true;
    });
  }, [maxIndex]);

  const player = useMemo<PlayerApi>(
    () => ({ stepIndex: clamped, playing, speed, maxIndex, setStepIndex, next, prev, toStart, toEnd, toggle, setSpeed }),
    [clamped, playing, speed, maxIndex, setStepIndex, next, prev, toStart, toEnd, toggle],
  );

  useAutoAdvance(player);
  return player;
}
