import { create } from 'zustand';
import { api } from '../api/client';
import type { EventResponse, TreeState } from '../domain/tree/api';
import { indexCatalog, type CatalogIndex } from '../domain/tree/catalogIndex';
import type { Catalog, ProgressEventInput } from '../domain/tree/types';

interface TreeStore {
  status: 'loading' | 'ready' | 'error';
  /** Falha ao carregar: a tela inteira mostra o erro. */
  error: string | null;
  /** Falha ao gravar: aviso por cima da tela, sem perder o que está aberto. */
  saveError: string | null;
  catalog: Catalog | null;
  index: CatalogIndex | null;
  state: TreeState | null;
  load: () => Promise<void>;
  /** Envia o evento e troca o estado pelo que o servidor devolveu. */
  send: (event: ProgressEventInput) => Promise<{ before: TreeState; response: EventResponse } | null>;
  dismissSaveError: () => void;
}

/**
 * O estado vem sempre do servidor. Não há cópia no navegador: se a API cair,
 * a tela mostra a falha em vez de guardar progresso em dois lugares.
 */
export const useTree = create<TreeStore>((set, get) => ({
  status: 'loading',
  error: null,
  saveError: null,
  catalog: null,
  index: null,
  state: null,

  load: async () => {
    set({ status: 'loading', error: null });
    try {
      const [catalog, state] = await Promise.all([api.catalog(), api.state()]);
      set({ status: 'ready', catalog, index: indexCatalog(catalog), state });
    } catch (error) {
      set({ status: 'error', error: error instanceof Error ? error.message : String(error) });
    }
  },

  send: async (event) => {
    const before = get().state;
    if (!before) return null;
    try {
      const response = await api.event(event);
      set({ state: response.state, saveError: null });
      return { before, response };
    } catch (error) {
      set({ saveError: error instanceof Error ? error.message : String(error) });
      return null;
    }
  },

  dismissSaveError: () => set({ saveError: null }),
}));

/** Catálogo e estado prontos. Só use dentro das telas, que já esperam o load. */
export function useReady(): { index: CatalogIndex; state: TreeState } {
  const index = useTree((s) => s.index);
  const state = useTree((s) => s.state);
  if (!index || !state) throw new Error('useReady fora de uma tela carregada');
  return { index, state };
}
