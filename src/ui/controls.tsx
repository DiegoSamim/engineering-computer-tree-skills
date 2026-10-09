import type { ButtonHTMLAttributes } from 'react';
import type { NodeState } from '../domain/tree/types';
import { Icon } from './Icon';
import { STATE_LABEL } from './labels';

/**
 * Peças base do design system. Não conhecem dados: recebem o que mostrar.
 * A cor vem de --c (a área corrente), nunca de uma prop de cor.
 */

/** Botão contornado: primário na cor da área, fantasma em neutros. */
export function Button({
  variant = 'primary',
  className = '',
  type = 'button',
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'primary' | 'ghost' }) {
  return <button type={type} className={`btn ${variant === 'ghost' ? 'ghost' : ''} ${className}`} {...props} />;
}

/** Estado do nó em uma palavra. Bloqueado é neutro; os outros usam a cor da área. */
export function StatePill({ state }: { state: NodeState }) {
  return (
    <span className={`pill ${state === 'bloqueado' ? '' : 'on'}`}>
      <span className="d" aria-hidden="true" />
      {STATE_LABEL[state]}
    </span>
  );
}

/** Um traço por nível possível, acesos até o nível atual. */
export function LevelPips({ level, max, withLabel = false }: { level: number; max: number; withLabel?: boolean }) {
  return (
    <span>
      <span className="pips" role="img" aria-label={`Nível ${level} de ${max}`}>
        {Array.from({ length: max }, (_, i) => (
          <i key={i} className={i < level ? 'on' : ''} />
        ))}
      </span>
      {withLabel && (
        <span className="pips-label">
          nível {level}/{max}
        </span>
      )}
    </span>
  );
}

/** Caixa de marcação (o controle de verdade é o botão que a contém). */
export function Check({ on }: { on: boolean }) {
  return (
    <span className={`check ${on ? 'on' : ''}`} aria-hidden="true">
      <Icon name="check" />
    </span>
  );
}
