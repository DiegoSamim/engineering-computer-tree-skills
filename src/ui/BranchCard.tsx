import type { Ref } from 'react';
import type { ConstellationView } from '../store/views';
import { Constellation } from './Constellation';

interface Props {
  name: string;
  view: ConstellationView;
  done: number;
  total: number;
  position: 'on' | 'near' | 'far';
  onClick: () => void;
  ref?: Ref<HTMLButtonElement>;
}

/** Carta de uma branch no carrossel: a constelação real em miniatura, nome e contador. */
export function BranchCard({ name, view, done, total, position, onClick, ref }: Props) {
  const central = position === 'on';
  return (
    <button
      ref={ref}
      type="button"
      className={`bcard ${position}`}
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
            <b>{done}</b> / {total} nós
          </>
        ) : (
          'nenhum nó ainda'
        )}
      </span>
      <span className="open">ABRIR CONSTELAÇÃO</span>
    </button>
  );
}
