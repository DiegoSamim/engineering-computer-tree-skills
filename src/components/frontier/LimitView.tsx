import { motion, AnimatePresence } from 'framer-motion';
import type { SimulationState } from '../../simulation/state';

interface Props {
  state: SimulationState;
}

/**
 * Visão do IDA*: o que importa não é uma fronteira ordenada, é o teto de f(n)
 * da rodada, quem o ultrapassou e qual será o próximo teto.
 */
export function LimitView({ state }: Props) {
  const limit = state.extra?.limit;
  const overLimit = state.extra?.overLimitNodes ?? [];
  const nextLimit = state.extra?.nextLimit;

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-3">
        <div
          className="flex h-12 w-12 shrink-0 flex-col items-center justify-center border"
          style={{ borderColor: 'var(--color-accent)', background: 'var(--color-accent-soft)' }}
        >
          <span className="font-mono-num text-[17px] font-semibold" style={{ color: 'var(--color-accent-strong)' }}>
            {limit ?? '—'}
          </span>
        </div>
        <div className="text-[11.5px] leading-relaxed text-ink-faint">
          Limite de <span className="font-mono-num text-ink-muted">f(n)</span> desta iteração. Só descemos por nós com
          f menor ou igual.
        </div>
      </div>

      <div>
        <div className="mb-1.5 font-mono-num text-[10.5px] uppercase tracking-wide text-ink-faint">
          Caminho atual
        </div>
        <div className="font-mono-num text-[12px] text-ink">
          {state.currentPath.length > 0 ? state.currentPath.join(' → ') : '—'}
        </div>
        <p className="mt-1 text-[11px] leading-relaxed text-ink-faint">
          É só isto que ocupa memória — nunca a fronteira inteira.
        </p>
      </div>

      {state.frontier.length > 0 && (
        <div>
          <div className="mb-1.5 font-mono-num text-[10.5px] uppercase tracking-wide text-ink-faint">
            Pendentes no caminho
          </div>
          <div className="flex flex-wrap gap-1">
            {state.frontier.map((e) => {
              const over = limit !== undefined && (e.f ?? 0) > limit;
              return (
                <span
                  key={e.nodeId}
                  className="border px-1.5 py-0.5 font-mono-num text-[11px]"
                  style={{
                    borderColor: over ? 'var(--border)' : 'var(--color-state-frontier)',
                    color: over ? 'var(--text-faint)' : 'var(--color-state-frontier)',
                  }}
                >
                  {e.nodeId} f={e.f}
                  {over ? ' ✕' : ''}
                </span>
              );
            })}
          </div>
          <p className="mt-1 text-[11px] leading-relaxed text-ink-faint">
            Alternativas ainda não tentadas nos pontos de decisão acima — elas somem assim que a recursão volta.
          </p>
        </div>
      )}

      <div>
        <div className="mb-1.5 font-mono-num text-[10.5px] uppercase tracking-wide text-ink-faint">
          Podados por limite
        </div>
        <div className="flex min-h-[22px] flex-wrap gap-1">
          <AnimatePresence initial={false}>
            {overLimit.length === 0 && <span className="text-[11.5px] text-ink-faint">nenhum ainda</span>}
            {overLimit.map((item, i) => (
              <motion.span
                key={`${item.node}-${i}`}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.2 }}
                className="border px-1.5 py-0.5 font-mono-num text-[11px]"
                style={{ borderColor: 'var(--color-state-danger)', color: 'var(--color-state-danger)' }}
              >
                {item.node} f={item.f}
              </motion.span>
            ))}
          </AnimatePresence>
        </div>
      </div>

      {nextLimit !== undefined && (
        <div
          className="border-l-2 pl-2.5 text-[11.5px] leading-relaxed"
          style={{ borderColor: 'var(--color-accent)' }}
        >
          Menor f podado: <span className="font-mono-num font-semibold text-ink">{nextLimit}</span>. É ele que vira o
          limite da próxima iteração.
        </div>
      )}
    </div>
  );
}
