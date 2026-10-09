import { useEffect } from 'react';
import { useToast } from '../store/useToast';

/** Aviso curto no rodapé ("Nível 2 atingido · Sliding Window liberado"). */
export function Toast() {
  const message = useToast((s) => s.message);
  const seq = useToast((s) => s.seq);
  const hide = useToast((s) => s.hide);

  useEffect(() => {
    if (!message) return;
    const id = setTimeout(hide, 2600);
    return () => clearTimeout(id);
  }, [message, seq, hide]);

  return (
    <div className={`toast ${message ? 'on' : ''}`} role="status" aria-live="polite">
      {message}
    </div>
  );
}
