import { Fragment, type Ref } from 'react';
import { requireLine, type NodeView } from '../../store/views';
import { LevelPips } from '../../ui/controls';
import { KIND_LABEL } from '../../ui/labels';

interface Props {
  view: NodeView;
  onMastery: () => void;
  masteryRef: Ref<HTMLButtonElement>;
}

/** Tipo, branch e tempo; título; resumo; linha "Requer"; botão Domínio com os pips. */
export function NodeHeader({ view, onMastery, masteryRef }: Props) {
  const { node } = view;
  const parts = requireLine(view);
  return (
    <header className="node-head">
      <div style={{ minWidth: 0, flex: 1 }}>
        <div className="k">
          <span className="dot" aria-hidden="true" />
          {KIND_LABEL[node.kind]} · {view.homeBranch.name}
          {node.estMinutes ? ` · ~${node.estMinutes} min` : ''}
        </div>
        <h1>{node.title}</h1>
        {node.summary && <p className="tagline">{node.summary}</p>}
        {parts.length > 0 && (
          <div className="req-line">
            <span>Requer</span>
            {parts.map((p, i) => (
              <Fragment key={p.label}>
                {i > 0 && <span aria-hidden="true">·</span>}
                <span>
                  <span className={p.met ? 'ok' : ''} aria-label={p.met ? 'cumprido' : 'pendente'}>
                    {p.met ? '✓' : '○'}
                  </span>{' '}
                  <b>{p.label}</b>
                </span>
              </Fragment>
            ))}
          </div>
        )}
      </div>
      <button ref={masteryRef} type="button" className="mastery-btn" onClick={onMastery} aria-haspopup="dialog">
        <span>Domínio</span>
        <LevelPips level={view.level} max={node.maxLevel} />
        <span>
          <b>Nível {view.level}</b> de {node.maxLevel}
        </span>
      </button>
    </header>
  );
}
