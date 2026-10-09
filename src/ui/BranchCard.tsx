import type { CSSProperties, Ref } from 'react';
import type { ConstellationView } from '../store/views';
import { Constellation } from './Constellation';

interface Props {
  name: string;
  view: ConstellationView;
  done: number;
  total: number;
  position: 'on' | 'near' | 'far';
  /** Deslocamento horizontal em relação ao centro, em px. */
  offsetX: number;
  /** Carta que deu a volta (de uma ponta à outra): troca de lugar sem animar. */
  jump: boolean;
  onClick: () => void;
  ref?: Ref<HTMLButtonElement>;
}

/** Carta de uma branch no carrossel: a constelação real em miniatura, nome e contador. */
export function BranchCard({ name, view, done, total, position, offsetX, jump, onClick, ref }: Props) {
  const central = position === 'on';
  return (
    <button
      ref={ref}
      type="button"
      className={`bcard ${position} ${jump ? 'jump' : ''}`}
      style={{ '--x': `${offsetX}px` } as CSSProperties}
      tabIndex={central ? 0 : -1}
      aria-label={central ? `${name}: abrir constelação` : `${name}: centralizar`}
      aria-current={central ? 'true' : undefined}
      onClick={onClick}
    >
      <Constellation view={view} label={name} />
      <span className="bname">{name}</span>
      <span className="bcount mono">
        {total > 0 ? (
          <>
            <b>{done}</b> / {total} habilidades
          </>
        ) : (
          'nenhuma habilidade ainda'
        )}
      </span>
      <span className="open">ABRIR CONSTELAÇÃO</span>
    </button>
  );
}
