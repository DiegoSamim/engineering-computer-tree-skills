import type { RefObject } from 'react';
import type { NodeStateView } from '../../domain/tree/api';
import { GUIDES } from '../../domain/tree/guides';
import { levelName } from '../../domain/tree/levels';
import type { NodeDef } from '../../domain/tree/types';
import { Check } from '../../ui/controls';
import { Drawer } from '../../ui/Drawer';

interface Props {
  open: boolean;
  onClose: () => void;
  returnFocus: RefObject<HTMLElement | null>;
  node: NodeDef;
  progress: NodeStateView | undefined;
  /** "Ao chegar no nível 2, Sliding Window é liberada na constelação." */
  hints: { title: string; minLevel: number }[];
  onToggle: (criterion: string, checked: boolean) => void;
}

/**
 * Gaveta Domínio: os critérios de cada nível. O nível sobe quando todos os
 * critérios dele (e dos anteriores) estão marcados; quem calcula é o servidor.
 */
export function MasteryDrawer({ open, onClose, returnFocus, node, progress, hints, onToggle }: Props) {
  const checked = new Set(progress?.criteria ?? []);
  const levels = Array.from({ length: node.maxLevel }, (_, i) => i + 1);
  const solved = Object.values(progress?.exercises ?? {}).filter((e) => e.solvedAt).length;

  return (
    <Drawer open={open} onClose={onClose} label={`Domínio de ${node.title}`} returnFocus={returnFocus}>
      {node.criteria.length === 0 ? (
        <>
          <h2>Domínio</h2>
          <p>Os critérios de cada nível aparecem quando o conteúdo desta habilidade for escrito.</p>
        </>
      ) : (
        <>
          <h2>Domínio de {node.title}</h2>
          <p>
            O nível sobe quando todos os critérios dele estão marcados.
            {hints.map((h) => ` Ao chegar no nível ${h.minLevel}, ${h.title} é liberada na constelação.`).join('')}
          </p>
          {levels.map((level) => {
            const criteria = node.criteria.filter((c) => c.level === level);
            const done = criteria.filter((c) => checked.has(c.id)).length;
            const reached = (progress?.level ?? 0) >= level;
            return (
              <section key={level} className={`lvl ${reached ? 'done' : ''}`}>
                <div className="lvl-h">
                  <b>
                    Nível {level} · {levelName(level)}
                  </b>
                  <span>{reached ? 'atingido' : `${done}/${criteria.length}`}</span>
                </div>
                {criteria.map((c) => {
                  const on = checked.has(c.id);
                  return (
                    <button key={c.id} type="button" className="crit" aria-pressed={on} onClick={() => onToggle(c.id, !on)}>
                      <Check on={on} />
                      <span>
                        <em>{c.label}</em>
                        {c.text}
                      </span>
                    </button>
                  );
                })}
              </section>
            );
          })}
        </>
      )}
      <div className="stats">
        <div>
          <b>
            {progress?.guides.length ?? 0}/{GUIDES.length}
          </b>
          guias lidas
        </div>
        <div>
          <b>
            {solved}/{node.exercises.length}
          </b>
          exercícios feitos
        </div>
      </div>
    </Drawer>
  );
}
