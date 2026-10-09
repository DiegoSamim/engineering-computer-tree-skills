import { useEffect, useRef, type ReactNode, type RefObject } from 'react';

interface Props {
  open: boolean;
  onClose: () => void;
  label: string;
  /** Para onde o foco volta ao fechar (o botão que abriu). */
  returnFocus: RefObject<HTMLElement | null>;
  children: ReactNode;
}

/**
 * Gaveta à direita sobre um fundo escurecido. Ao abrir, o foco vai para o
 * botão de fechar; Esc ou clique fora fecham, e o foco volta a quem abriu.
 * O Esc é tratado aqui antes do "subir um nível" da tela.
 */
export function Drawer({ open, onClose, label, returnFocus, children }: Props) {
  const close = useRef<HTMLButtonElement>(null);
  const wasOpen = useRef(false);

  useEffect(() => {
    if (open) {
      close.current?.focus();
    } else if (wasOpen.current) {
      returnFocus.current?.focus();
    }
    wasOpen.current = open;
  }, [open, returnFocus]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return;
      e.preventDefault();
      onClose();
    };
    window.addEventListener('keydown', onKey, true);
    return () => window.removeEventListener('keydown', onKey, true);
  }, [open, onClose]);

  return (
    <>
      <div className={`scrim ${open ? 'on' : ''}`} onClick={onClose} aria-hidden="true" />
      <aside className={`drawer ${open ? 'on' : ''}`} aria-label={label} aria-hidden={!open} role="dialog" aria-modal="true">
        <button ref={close} type="button" className="x" aria-label="Fechar" onClick={onClose}>
          ×
        </button>
        {children}
      </aside>
    </>
  );
}
