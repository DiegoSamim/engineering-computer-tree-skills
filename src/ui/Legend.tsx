/** Legenda da constelação: os estados de uma estrela e a linha alternativa. */
export function Legend() {
  return (
    <div className="legend" aria-label="Legenda">
      <span>
        <svg viewBox="0 0 18 18" aria-hidden="true">
          <circle className="l-fill" cx="9" cy="9" r="5" />
        </svg>
        Dominado
      </span>
      <span>
        <svg viewBox="0 0 18 18" aria-hidden="true">
          <circle className="l-ring" cx="9" cy="9" r="5" />
          <circle className="l-fill" cx="9" cy="9" r="2" />
        </svg>
        Em progresso
      </span>
      <span>
        <svg viewBox="0 0 18 18" aria-hidden="true">
          <circle className="l-ring" cx="9" cy="9" r="5" />
        </svg>
        Disponível
      </span>
      <span>
        <svg viewBox="0 0 18 18" aria-hidden="true">
          <circle className="l-off" cx="9" cy="9" r="5" />
        </svg>
        Bloqueado
      </span>
      <span>
        <svg viewBox="0 0 18 18" aria-hidden="true">
          <circle className="l-ring l-dash" cx="9" cy="9" r="5" />
        </svg>
        Sem conteúdo
      </span>
      <span>
        <svg viewBox="0 0 18 18" aria-hidden="true">
          <circle className="l-ring" cx="9" cy="9" r="4" />
          <circle className="l-mirror" cx="9" cy="9" r="7.5" />
        </svg>
        Espelho de outra branch
      </span>
      <span>
        <svg viewBox="0 0 18 18" aria-hidden="true">
          <line className="l-alt" x1="1" y1="9" x2="17" y2="9" />
        </svg>
        Requisito alternativo (OU)
      </span>
    </div>
  );
}
