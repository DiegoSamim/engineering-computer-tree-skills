import { useEffect, useRef } from 'react';

/**
 * Esc sobe um nível. Cada tela diz o que "subir" significa para ela; o
 * handler mais recente vence, e quem abre uma gaveta trata o Esc antes.
 */
export function useEscape(handler: () => void): void {
  const ref = useRef(handler);
  useEffect(() => {
    ref.current = handler;
  });

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Escape' || e.defaultPrevented) return;
      ref.current();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);
}
