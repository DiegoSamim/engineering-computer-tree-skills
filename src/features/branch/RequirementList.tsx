import type { CSSProperties } from 'react';
import type { NodeView } from '../../store/views';

/**
 * Requisitos como a UI mostra: ✓ cumprido, ○ pendente, "OU" entre
 * alternativas, área de origem quando é outra, e "recomendado".
 */
export function RequirementList({ groups }: { groups: NodeView['requirements'] }) {
  if (groups.length === 0) return <p className="hint">Nenhum requisito. É um ponto de entrada.</p>;

  return (
    <ul className="reqs">
      {groups.flatMap((group, g) =>
        group.items.flatMap((item, i) => {
          const label = item.target.type === 'node' ? item.target.title : `Branch ${item.target.name}`;
          const row = (
            <li key={`${g}-${i}`}>
              <span className={item.met ? 'ok' : 'no'} aria-label={item.met ? 'cumprido' : 'pendente'}>
                {item.met ? '✓' : '○'}
              </span>
              <span>
                {label}
                {item.otherArea && (
                  <span className="other-area" style={{ '--ac': item.otherArea.color } as CSSProperties}>
                    {' '}
                    · {item.otherArea.name}
                  </span>
                )}
                {group.strength === 'recomendado' && <span className="note"> · recomendado</span>}
              </span>
              {item.minLevel > 1 && <small>nível {item.minLevel}</small>}
            </li>
          );
          return i > 0
            ? [
                <li key={`${g}-${i}-ou`} className="or" aria-hidden="true">
                  OU
                </li>,
                row,
              ]
            : [row];
        }),
      )}
    </ul>
  );
}
