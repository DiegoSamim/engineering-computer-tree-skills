import type { CSSProperties } from 'react';
import type { AreaIcon } from '../domain/tree/types';
import { Icon } from './Icon';

interface Props {
  name: string;
  icon: AreaIcon;
  color: string;
  /** Posição no palco, em %. */
  x: number;
  y: number;
  /** Ordem, para a entrada escalonada. */
  i: number;
  done: number;
  total: number;
  /** Área sem branches aparece, mas não abre. */
  open: boolean;
  picked: boolean;
  onOpen: () => void;
  onHover: (on: boolean) => void;
}

const ARC = 2 * Math.PI * 23;

/**
 * A orbe de uma área no céu: disco escuro com borda e brilho na cor da área,
 * ícone ao centro, nome abaixo e o arco de `feitos / total` por fora.
 */
export function AreaOrb({ name, icon, color, x, y, i, done, total, open, picked, onOpen, onHover }: Props) {
  const style = { left: `${x}%`, top: `${y}%`, '--i': i, '--c': color } as CSSProperties;
  const body = (
    <>
      <span className="halo" />
      {total > 0 && (
        <svg className="arc" viewBox="0 0 50 50" aria-hidden="true">
          <circle cx="25" cy="25" r="23" strokeDasharray={`${(ARC * done) / total} ${ARC}`} vectorEffect="non-scaling-stroke" />
        </svg>
      )}
      <span className="disc" />
      <Icon name={icon} className="icon" />
      <span className="label">
        {name}
        {!open && <small>em breve</small>}
      </span>
    </>
  );

  if (!open) {
    return (
      <div className="orb" style={style} role="img" aria-label={`${name}: em breve`}>
        {body}
      </div>
    );
  }

  return (
    <button
      type="button"
      className={`orb open ${picked ? 'picked' : ''}`}
      style={style}
      aria-label={`${name}: ${done} de ${total} habilidades`}
      onClick={onOpen}
      onMouseEnter={() => onHover(true)}
      onMouseLeave={() => onHover(false)}
      onFocus={() => onHover(true)}
      onBlur={() => onHover(false)}
    >
      {body}
    </button>
  );
}
