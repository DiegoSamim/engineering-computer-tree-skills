import { motion, AnimatePresence } from 'framer-motion';
import type { FrontierEntry } from '../../simulation/events';

interface Props {
  entries: FrontierEntry[];
}

/**
 * Backtracking's frontier: only the untried alternatives at the *current*
 * decision point — never a global stack of everything discovered so far.
 * Visually distinct from StackView on purpose, so the difference from DFS
 * reads immediately, not just in the narration text.
 */
export function AlternativesView({ entries }: Props) {
  return (
    <div>
      <div className="mb-2 flex min-h-[40px] flex-wrap gap-1.5">
        <AnimatePresence initial={false} mode="popLayout">
          {entries.length === 0 && <span className="text-[12px] text-ink-faint">nenhuma alternativa aqui</span>}
          {entries.map((entry, i) => (
            <motion.div
              key={entry.nodeId}
              layout
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 6 }}
              transition={{ duration: 0.22 }}
              className="flex h-8 items-center gap-1 border px-2.5 font-mono-num text-[12.5px] font-medium"
              style={{
                borderColor: i === 0 ? 'var(--color-accent)' : 'var(--border-strong)',
                color: i === 0 ? 'var(--color-accent-strong)' : 'var(--text-muted)',
                background: i === 0 ? 'var(--color-accent-soft)' : 'transparent',
              }}
            >
              {entry.nodeId}
              {i === 0 && <span className="text-[9px] uppercase tracking-wide">próxima</span>}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
      <p className="text-[11.5px] leading-relaxed text-ink-faint">
        Só as alternativas <strong className="text-ink-muted">deste</strong> ponto de decisão — não um histórico
        global. Ao voltar (backtrack), esta lista some.
      </p>
    </div>
  );
}
