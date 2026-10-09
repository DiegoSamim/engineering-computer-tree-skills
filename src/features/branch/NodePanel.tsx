import { Fragment, type CSSProperties } from 'react';
import type { NodeView } from '../../store/views';
import { Button, LevelPips, StatePill } from '../../ui/controls';
import { CONTENT_LABEL, KIND_LABEL } from '../../ui/labels';
import { RequirementList } from './RequirementList';

interface Props {
  view: NodeView | null;
  onOpen: (slug: string) => void;
  onGoHome: (view: NodeView) => void;
}

/** Painel do nó selecionado: estado, nível, o que ele exige e o que ele libera. */
export function NodePanel({ view, onOpen, onGoHome }: Props) {
  if (!view) {
    return (
      <p className="hint">
        Selecione uma estrela para ver o que ela exige e o que ela libera. Duplo clique ou Enter abre o conteúdo.
      </p>
    );
  }

  const { node } = view;
  return (
    <>
      <div style={{ '--home': view.homeArea.color } as CSSProperties}>
        <StatePill state={view.state} />
        <h2>{node.title}</h2>
        <div className="home">
          {view.mirror ? (
            <>
              Espelho · casa em{' '}
              <i>
                {view.homeArea.name} / {view.homeBranch.name}
              </i>
            </>
          ) : (
            `${KIND_LABEL[node.kind]} · ${CONTENT_LABEL[node.content]}`
          )}
        </div>
      </div>

      <LevelPips level={view.level} max={node.maxLevel} withLabel />

      {node.summary && <p>{node.summary}</p>}

      <div>
        <h3>Requisitos</h3>
        <RequirementList groups={view.requirements} />
      </div>

      {view.unlocks.length > 0 && (
        <div>
          <h3>Libera</h3>
          <ul className="reqs">
            {view.unlocks.map((u) => (
              <li key={u.slug}>
                <span className="no" aria-hidden="true">
                  →
                </span>
                <span>
                  {u.title}
                  {u.otherArea && (
                    <Fragment>
                      {' '}
                      <span className="other-area" style={{ '--ac': u.otherArea.color } as CSSProperties}>
                        · {u.otherArea.name}
                      </span>
                    </Fragment>
                  )}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="actions">
        <Button onClick={() => onOpen(node.slug)}>Abrir habilidade</Button>
        {view.mirror && (
          <Button variant="ghost" onClick={() => onGoHome(view)}>
            Ir para a casa
          </Button>
        )}
      </div>
    </>
  );
}
