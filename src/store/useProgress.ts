import { create } from 'zustand';
import { getRepository } from '../data/repository';
import { initRepository } from '../data/bootstrap';
import { applyProgressEvent } from '../data/reducer';
import {
  createEmptySnapshot,
  createEmptyTopicProgress,
  type ProgressEvent,
  type ProgressSnapshot,
  type TopicProgress,
} from '../data/types';

interface ProgressStore {
  snapshot: ProgressSnapshot;
  loaded: boolean;
  /** Mensagem de falha de conexão, se houver. Nunca silenciamos isto. */
  error: string | null;
  hydrate: () => Promise<void>;
  dispatch: (event: ProgressEvent) => Promise<void>;
  reset: () => Promise<void>;
}

export const useProgress = create<ProgressStore>((set, get) => ({
  snapshot: createEmptySnapshot(),
  loaded: false,
  error: null,

  hydrate: async () => {
    set({ error: null });
    try {
      await initRepository();
      const snapshot = await getRepository().load();
      set({ snapshot, loaded: true });
    } catch (error) {
      // Deliberadamente NÃO caímos de volta no localStorage: duas fontes de
      // verdade divergindo em silêncio é pior que uma falha visível.
      set({ error: error instanceof Error ? error.message : String(error), loaded: false });
    }
  },

  dispatch: async (event) => {
    // Optimistic: fold locally first so the UI never waits on I/O, then let
    // the repository's return value win. Identical for localStorage; matters
    // the moment this becomes an HTTP round-trip.
    const optimistic = applyProgressEvent(get().snapshot, event);
    const previous = get().snapshot;
    set({ snapshot: optimistic });

    try {
      set({ snapshot: await getRepository().append(event), error: null });
    } catch (error) {
      // A escrita não chegou ao servidor: desfaz o otimismo em vez de deixar a
      // tela mostrando um progresso que não foi salvo em lugar nenhum.
      set({ snapshot: previous, error: error instanceof Error ? error.message : String(error) });
    }
  },

  reset: async () => {
    const snapshot = await getRepository().clear();
    set({ snapshot });
  },
}));

/** Progress for one topic, always defined (empty rather than undefined). */
export function useTopicProgress(topicId: string): TopicProgress {
  return useProgress((s) => s.snapshot.topics[topicId]) ?? createEmptyTopicProgress();
}

export function useDisplayName(): string | null {
  return useProgress((s) => s.snapshot.profile?.displayName ?? null);
}
