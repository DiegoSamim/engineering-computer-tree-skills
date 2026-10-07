import { useMemo } from 'react';
import { useSimulation } from '../store/useSimulation';
import { useAutoAdvance } from './useAutoAdvance';
import type { PlayerApi } from './types';

/**
 * Adapts the graph lab's global simulation store to the generic PlayerApi.
 * This exists so the lab keeps its global, cross-component playback state
 * (the compare view drives two canvases from one player) while still using
 * the same controls and timeline as every other visualizer.
 */
export function useSimulationPlayer(maxIndex: number): PlayerApi {
  const stepIndex = useSimulation((s) => s.stepIndex);
  const playing = useSimulation((s) => s.playing);
  const speed = useSimulation((s) => s.speed);
  const setStepIndex = useSimulation((s) => s.setStepIndex);
  const stepForward = useSimulation((s) => s.stepForward);
  const stepBackward = useSimulation((s) => s.stepBackward);
  const goToStart = useSimulation((s) => s.goToStart);
  const goToEnd = useSimulation((s) => s.goToEnd);
  const togglePlaying = useSimulation((s) => s.togglePlaying);
  const setSpeed = useSimulation((s) => s.setSpeed);

  const player = useMemo<PlayerApi>(
    () => ({
      stepIndex: Math.min(stepIndex, Math.max(maxIndex, 0)),
      playing,
      speed,
      maxIndex,
      setStepIndex,
      next: () => stepForward(maxIndex),
      prev: stepBackward,
      toStart: goToStart,
      toEnd: () => goToEnd(maxIndex),
      toggle: () => togglePlaying(maxIndex),
      setSpeed,
    }),
    [stepIndex, playing, speed, maxIndex, setStepIndex, stepForward, stepBackward, goToStart, goToEnd, togglePlaying, setSpeed],
  );

  useAutoAdvance(player);
  return player;
}
