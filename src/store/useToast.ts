import { create } from 'zustand';

interface ToastStore {
  message: string | null;
  /** Muda a cada aviso, para o mesmo texto repetido reiniciar o tempo. */
  seq: number;
  show: (message: string) => void;
  hide: () => void;
}

export const useToast = create<ToastStore>((set) => ({
  message: null,
  seq: 0,
  show: (message) => set((s) => ({ message, seq: s.seq + 1 })),
  hide: () => set({ message: null }),
}));
