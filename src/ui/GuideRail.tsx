import { useLayoutEffect, useRef, useState } from 'react';

interface Props {
  guides: readonly { id: string; label: string }[];
  current: string;
  read: ReadonlySet<string>;
  onSelect: (id: string) => void;
  /** Rodapé: "3/12 lidas · 1/5 exercícios". */
  meta: string;
}

/**
 * Navegação entre as guias desenhada como tronco de constelação: pontos
 * ligados por uma linha que acende até a guia atual. Lida = ponto a 30%;
 * atual = cheio com brilho. Abaixo de 900px vira faixa horizontal (CSS).
 */
export function GuideRail({ guides, current, read, onSelect, meta }: Props) {
  const items = useRef<(HTMLLIElement | null)[]>([]);
  const [fill, setFill] = useState(0);
  const currentIndex = guides.findIndex((g) => g.id === current);

  useLayoutEffect(() => {
    const measure = () => {
      const li = items.current[currentIndex];
      if (li) setFill(Math.max(0, li.offsetTop + li.offsetHeight / 2 - 10));
      li?.scrollIntoView?.({ block: 'nearest', inline: 'center' });
    };
    measure();
    addEventListener('resize', measure);
    return () => removeEventListener('resize', measure);
  }, [currentIndex]);

  return (
    <nav className="guide" aria-label="Guias do nó">
      <div className="rail">
        <ol>
          {guides.map((g, i) => (
            <li
              key={g.id}
              ref={(el) => {
                items.current[i] = el;
              }}
              className={`${i === currentIndex ? 'cur' : ''} ${read.has(g.id) ? 'read' : ''}`}
            >
              <button type="button" aria-current={i === currentIndex ? 'step' : undefined} onClick={() => onSelect(g.id)}>
                <span className="pt" aria-hidden="true" />
                <span className="t">{g.label}</span>
                {read.has(g.id) && <span className="sr-only"> (lida)</span>}
              </button>
            </li>
          ))}
        </ol>
        <span className="fillline" style={{ height: fill }} aria-hidden="true" />
      </div>
      <div className="meta mono">{meta}</div>
    </nav>
  );
}
