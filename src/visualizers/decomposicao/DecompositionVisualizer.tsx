import { useMemo, useState } from 'react';
import { usePlayer } from '../../player/usePlayer';
import { VizControls } from '../VizControls';
import { buildDecompositionTrace, type DecompNode, type DecompState } from './run';

const PRESETS = [
  { label: 'Turma A', notas: [7, 9, 6, 8] },
  { label: 'Turma B', notas: [5, 6, 8, 4] },
];

const fmt = (n: number) => String(Math.round(n * 100) / 100).replace('.', ',');

/**
 * Um problema virando algoritmo: a árvore entrada → processamento → saída
 * aparece etapa por etapa, e depois o algoritmo montado roda sobre a entrada.
 * A lógica é a de `run.ts`; aqui só se desenha.
 */
export function DecompositionVisualizer() {
  const [preset, setPreset] = useState(0);
  const { notas } = PRESETS[preset];
  const trace = useMemo(() => buildDecompositionTrace(notas), [notas]);
  const player = usePlayer(trace.steps.length - 1);
  const step = trace.steps[player.stepIndex];
  const { state } = step;

  const choose = (i: number) => {
    setPreset(i);
    player.toStart();
  };

  return (
    <>
      <div className="viz">
        <div className="viz-top">
          <div className="seg" role="tablist" aria-label="Exemplo">
            {PRESETS.map((p, i) => (
              <button
                key={p.label}
                type="button"
                role="tab"
                aria-selected={i === preset}
                className={i === preset ? 'on' : ''}
                onClick={() => choose(i)}
              >
                {p.label} · {p.notas.length} notas
              </button>
            ))}
          </div>
          <span>
            fase: <b>{state.phase === 'decompor' ? 'decompor' : 'executar'}</b>
          </span>
        </div>

        <div className="dtree" aria-label="Decomposição do problema">
          <TreeNode node={trace.tree} state={state} depth={0} />
        </div>

        {state.phase === 'executar' && <Memory notas={trace.notas} state={state} />}

        <div className="narr" aria-live="polite">
          <h4>{step.narration.title}</h4>
          <p>{step.narration.text}</p>
        </div>

        <VizControls player={player} />
      </div>
      <p className="guide-note">Primeiro decompor, depois executar. Um passo só vira código quando não dá mais para quebrar.</p>
    </>
  );
}

function TreeNode({ node, state, depth }: { node: DecompNode; state: DecompState; depth: number }) {
  const revealed = state.revealed.includes(node.id);
  const status = node.id === state.current ? 'cur' : revealed ? 'on' : 'pending';
  const children = node.children ?? [];
  return (
    <div className="dbranch">
      <div className={`dnode ${status}`} aria-current={status === 'cur' ? 'step' : undefined}>
        {revealed ? (
          <>
            <span>{node.label}</span>
            {node.detail && <small>{node.detail}</small>}
          </>
        ) : (
          <span aria-label="etapa ainda não descoberta">…</span>
        )}
      </div>
      {children.length > 0 && (
        <div className={depth === 0 ? 'drow' : 'dcol'}>
          {children.map((child) => (
            <TreeNode key={child.id} node={child} state={state} depth={depth + 1} />
          ))}
        </div>
      )}
    </div>
  );
}

/** Memória durante a execução: as notas (a atual em destaque) e as variáveis. */
function Memory({ notas, state }: { notas: number[]; state: DecompState }) {
  const { vars } = state;
  return (
    <div className="mem">
      <div className="mem-notas" aria-label="Notas da entrada">
        {notas.map((n, i) => (
          <div key={i} className={`cell ${vars.indice === i ? 'hit' : ''} ${vars.indice !== undefined && i < vars.indice ? 'done' : ''}`}>
            <span className="ix">{i}</span>
            {n}
          </div>
        ))}
      </div>
      <dl className="vars">
        <dt>soma</dt>
        <dd>{vars.soma ?? '—'}</dd>
        <dt>média</dt>
        <dd>{vars.media !== undefined ? fmt(vars.media) : '—'}</dd>
        <dt>situação</dt>
        <dd>{vars.resultado ?? '—'}</dd>
      </dl>
    </div>
  );
}
