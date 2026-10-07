import { motion, AnimatePresence } from 'framer-motion';
import type { FrontierEntry } from '../../simulation/events';

interface Props {
  entries: FrontierEntry[];
}

export function StackView({ entries }: Props) {
  return (
    <div>
      <div className="mb-2 font-mono-num text-[10.5px] uppercase tracking-wide text-ink-faint">Topo</div>
      <div className="flex min-h-[40px] flex-col gap-1.5">
        <AnimatePresence initial={false} mode="popLayout">
          {entries.length === 0 && <span className="text-[12px] text-ink-faint">vazia</span>}
          {entries.map((entry) => (
            <motion.div
              key={entry.nodeId}
              layout
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              transition={{ duration: 0.22 }}
              className="flex h-8 items-center justify-start border px-3 font-mono-num text-[12.5px] font-medium"
              style={{
                borderColor: 'var(--color-state-frontier)',
                color: 'var(--color-state-frontier)',
                background: 'color-mix(in srgb, var(--color-state-frontier) 10%, var(--bg-raised))',
              }}
            >
              {entry.nodeId}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
      <p className="mt-2 text-[11.5px] leading-relaxed text-ink-faint">
        <strong className="text-ink-muted">LIFO</strong> — Last In, First Out. Último a entrar, primeiro a sair.
      </p>
    </div>
  );
}
