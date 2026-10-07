import { create } from 'zustand';
import { mainGraph } from '../graphs/main-graph';
import { bfs } from '../algorithms/bfs';
import type { PlaybackSpeed } from '../player/types';

export type { PlaybackSpeed };

export type Tab = 'visualizacao' | 'teoria' | 'codigo' | 'comparacao';

interface SimulationStore {
  graphId: string;
  algorithmId: string;
  stepIndex: number;
  playing: boolean;
  speed: PlaybackSpeed;
  activeTab: Tab;
  compareAlgorithmId: string;

  setGraph: (graphId: string) => void;
  setAlgorithm: (algorithmId: string) => void;
  setCompareAlgorithm: (algorithmId: string) => void;
  setStepIndex: (index: number) => void;
  stepForward: (max: number) => void;
  stepBackward: () => void;
  goToStart: () => void;
  goToEnd: (max: number) => void;
  play: () => void;
  pause: () => void;
  togglePlaying: (max: number) => void;
  setSpeed: (speed: PlaybackSpeed) => void;
  setActiveTab: (tab: Tab) => void;
}

export const useSimulation = create<SimulationStore>((set) => ({
  graphId: mainGraph.id,
  algorithmId: bfs.id,
  stepIndex: 0,
  playing: false,
  speed: 1,
  activeTab: 'visualizacao',
  compareAlgorithmId: 'dfs',

  setGraph: (graphId) => set({ graphId, stepIndex: 0, playing: false }),
  setAlgorithm: (algorithmId) => set({ algorithmId, stepIndex: 0, playing: false }),
  setCompareAlgorithm: (compareAlgorithmId) => set({ compareAlgorithmId, stepIndex: 0, playing: false }),

  setStepIndex: (index) => set({ stepIndex: Math.max(0, index) }),

  stepForward: (max) =>
    set((s) => {
      const next = Math.min(s.stepIndex + 1, max);
      return { stepIndex: next, playing: next < max && s.playing };
    }),

  stepBackward: () => set((s) => ({ stepIndex: Math.max(0, s.stepIndex - 1), playing: false })),

  goToStart: () => set({ stepIndex: 0, playing: false }),

  goToEnd: (max) => set({ stepIndex: max, playing: false }),

  play: () => set({ playing: true }),
  pause: () => set({ playing: false }),

  togglePlaying: (max) =>
    set((s) => {
      if (s.playing) return { playing: false };
      // Restart from the beginning if play is pressed at the very end.
      return s.stepIndex >= max ? { playing: true, stepIndex: 0 } : { playing: true };
    }),

  setSpeed: (speed) => set({ speed }),
  setActiveTab: (activeTab) => set({ activeTab }),
}));
