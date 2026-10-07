import { motion } from 'framer-motion';
import type { TwoPointersState } from './run';

interface Props {
  nums: number[];
  target: number;
  state: TwoPointersState;
}

type CellRole = 'default' | 'left' | 'right' | 'discarded';

function roleOf(index: number, state: TwoPointersState): CellRole {
  if (index < state.left || index > state.right) return 'discarded';
  if (index === state.left) return 'left';
  if (index === state.right) return 'right';
  return 'default';
}

function isFound(index: number, state: TwoPointersState): boolean {
  return Boolean(state.found && (index === state.found[0] || index === state.found[1]));
}

/** Cor + peso de borda + rótulo — nunca só cor, pelos mesmos motivos do grafo. */
const CELL_STYLE: Record<CellRole, { border: string; bg: string; color: string; width: number }> = {
  default: { border: 'var(--border-strong)', bg: 'var(--bg-raised)', color: 'var(--text)', width: 1.5 },
  left: { border: 'var(--color-success)', bg: 'var(--color-success-soft)', color: 'var(--color-success)', width: 2.5 },
  right: { border: 'var(--color-state-danger)', bg: 'rgba(248,81,73,.12)', color: 'var(--color-state-danger)', width: 2.5 },
  discarded: { border: 'var(--border)', bg: 'transparent', color: 'var(--text-faint)', width: 1 },
};

const FOUND_STYLE = { border: 'var(--color-accent)', bg: 'var(--color-accent-soft)', color: 'var(--color-accent-strong)', width: 3 };

export function TwoPointersCanvas({ nums, target, state }: Props) {
  return (
    <div className="flex flex-col items-center justify-center gap-5 px-4 py-6">
      <div className="flex items-baseline gap-4 font-mono-num text-[12px]">
        <span className="text-ink-faint">
          alvo = <span className="font-semibold text-ink">{target}</span>
        </span>
        {state.sum !== undefined && (
          <span className="text-ink-faint">
            soma ={' '}
            <span
              className="font-semibold"
              style={{
                color:
                  state.sum === target
                    ? 'var(--color-accent)'
                    : state.sum > target
                      ? 'var(--color-state-danger)'
                      : 'var(--color-warn)',
              }}
            >
              {state.sum}
            </span>
            {state.sum !== target && (
              <span className="ml-1 text-ink-faint">({state.sum > target ? 'maior' : 'menor'})</span>
            )}
          </span>
        )}
      </div>

      <div className="flex flex-wrap justify-center gap-1.5">
        {nums.map((value, i) => {
          const role = roleOf(i, state);
          const found = isFound(i, state);
          // O par encontrado repinta a célula, mas o papel (left/right) é
          // preservado para que os ponteiros continuem visíveis no fim.
          const style = found ? FOUND_STYLE : CELL_STYLE[role];
          const isPointer = role === 'left' || role === 'right';

          return (
            <div key={i} className="flex w-[58px] flex-col items-center gap-1">
              <span className="font-mono-num text-[10px] text-ink-faint">{i}</span>

              <motion.div
                animate={{
                  scale: isPointer || found ? 1.06 : 1,
                  opacity: role === 'discarded' ? 0.4 : 1,
                }}
                transition={{ duration: 0.22 }}
                className="flex h-[52px] w-full items-center justify-center font-mono-num text-[17px] font-semibold"
                style={{
                  border: `${style.width}px solid ${style.border}`,
                  background: style.bg,
                  color: style.color,
                  textDecoration: role === 'discarded' ? 'line-through' : undefined,
                }}
              >
                {value}
              </motion.div>

              <div className="flex h-9 flex-col items-center">
                {isPointer && (
                  <motion.div
                    layoutId={role}
                    transition={{ type: 'spring', stiffness: 420, damping: 34 }}
                    className="flex flex-col items-center"
                  >
                    <span aria-hidden="true" style={{ color: CELL_STYLE[role].color }} className="text-[13px] leading-none">
                      ↑
                    </span>
                    <span
                      className="font-mono-num text-[10.5px] font-semibold leading-tight"
                      style={{ color: CELL_STYLE[role].color }}
                    >
                      {role}
                    </span>
                  </motion.div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {state.status === 'found' && state.found && (
        <div className="font-mono-num text-[12.5px]" style={{ color: 'var(--color-accent)' }}>
          resposta: índices [{state.found[0]}, {state.found[1]}]
        </div>
      )}
      {state.status === 'exhausted' && (
        <div className="font-mono-num text-[12.5px] text-ink-faint">nenhum par soma {target}</div>
      )}
    </div>
  );
}
