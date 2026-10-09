import { useMemo, useState, type CSSProperties } from 'react';
import { usePlayer } from '../../player/usePlayer';
import { VizControls } from '../VizControls';
import { buildTwoPointersTrace } from './run';

const PRESETS = [
  { nums: [1, 2, 3, 4, 6, 8, 9, 11], target: 9 },
  { nums: [1, 3, 4, 5, 7, 10, 11], target: 9 },
];

/**
 * Two Pointers de extremos opostos, passo a passo. A lógica é a de
 * `run.ts` (comparar é um passo, mover é outro); aqui só se desenha.
 */
export function TwoPointersVisualizer() {
  const [preset, setPreset] = useState(0);
  const { nums, target } = PRESETS[preset];
  const trace = useMemo(() => buildTwoPointersTrace(nums, target), [nums, target]);
  const player = usePlayer(trace.steps.length - 1);
  const step = trace.steps[player.stepIndex];
  const { left, right, sum, found } = step.state;

  const cellClass = (i: number) => {
    if (found?.includes(i)) return 'cell found';
    const gone = i < left || i > right;
    const hit = sum !== undefined && (i === left || i === right);
    return `cell ${gone ? 'gone' : ''} ${hit && !gone ? 'hit' : ''}`;
  };

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
                key={i}
                type="button"
                role="tab"
                aria-selected={i === preset}
                className={i === preset ? 'on' : ''}
                onClick={() => choose(i)}
              >
                Alvo {p.target} · {p.nums.length} itens
              </button>
            ))}
          </div>
          <span>
            target = <b>{target}</b>
          </span>
        </div>

        <div className="arr-wrap">
          <div className="arr">
            {nums.map((v, i) => (
              <div key={i} className={cellClass(i)}>
                <span className="ix">{i}</span>
                {v}
              </div>
            ))}
            <div className="ptr" style={{ '--p': left } as CSSProperties}>
              left
            </div>
            <div className="ptr r" style={{ '--p': right } as CSSProperties}>
              right
            </div>
          </div>
        </div>

        <div className="narr" aria-live="polite">
          <h4>{step.narration.title}</h4>
          <p>{step.narration.text}</p>
        </div>

        <VizControls player={player} />
      </div>
      <p className="guide-note">Comparar é um passo, mover é outro. Duas decisões nunca acontecem na mesma animação.</p>
    </>
  );
}
