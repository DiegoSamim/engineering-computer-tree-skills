import { Fragment } from 'react';
import { Link } from 'react-router-dom';
import { Icon } from './Icon';

export interface Crumb {
  label: string;
  /** Ausente no último (onde você está). */
  to?: string;
  /** Estado da navegação (ex.: qual branch centralizar ao voltar). */
  state?: unknown;
}

/** Marca, caminho e o contador global "feitas / total habilidades". */
export function TopBar({ crumbs = [], done, total }: { crumbs?: Crumb[]; done: number; total: number }) {
  return (
    <header className="topbar">
      <Link to="/" className="brand" aria-label="Início">
        <Icon name="brand" />
        <span>Computer Tree Skills</span>
      </Link>
      <nav className="crumbs" aria-label="Caminho">
        {crumbs.map((c, i) => (
          <Fragment key={c.label + i}>
            <span className="sep" aria-hidden="true">
              /
            </span>
            {c.to ? (
              <Link to={c.to} state={c.state}>
                {c.label}
              </Link>
            ) : (
              <span className="here" aria-current="page">
                {c.label}
              </span>
            )}
          </Fragment>
        ))}
      </nav>
      <span className="total" aria-label={`${done} de ${total} habilidades concluídas`}>
        <b>{done}</b> / {total} habilidades
      </span>
    </header>
  );
}
