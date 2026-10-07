import type { Narration } from '../simulation/types';

export type PlaybackSpeed = 0.5 | 1 | 1.5 | 2;

/**
 * Everything the player UI needs from a trace: a list of steps that each
 * carry narration. Deliberately minimal — the graph `Trace` satisfies this
 * structurally, and so does any future visualizer, without either knowing
 * about the other.
 */
export interface PlayableTrace {
  steps: { narration: Narration }[];
}

/**
 * The playback contract. Implemented twice: `usePlayer` (local state, for new
 * visualizers) and `useSimulationPlayer` (adapter over the graph lab's global
 * store). Components depend on this interface and never on either store.
 */
export interface PlayerApi {
  stepIndex: number;
  playing: boolean;
  speed: PlaybackSpeed;
  maxIndex: number;
  setStepIndex: (index: number) => void;
  next: () => void;
  prev: () => void;
  toStart: () => void;
  toEnd: () => void;
  toggle: () => void;
  setSpeed: (speed: PlaybackSpeed) => void;
}
