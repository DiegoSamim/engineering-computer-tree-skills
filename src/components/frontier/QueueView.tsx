import { motion, AnimatePresence } from 'framer-motion';
import type { FrontierEntry } from '../../simulation/events';

interface Props {
  entries: FrontierEntry[];
}

export function QueueView({ entries }: Props) {
  return (
    <div>
      <div className="mb-2 flex items-center justify-between font-mono-num text-[10.5px] uppercase tracking-wide text-ink-faint">
        <span>Entrada →</span>
        <span>← Saída</span>
      </div>
      <div className="flex min-h-[40px] items-center gap-1.5 overflow-x-auto">
        <AnimatePresence initial={false} mode="popLayout">
          {entries.length === 0 && <span className="text-[12px] text-ink-faint">vazia</span>}
          {entries.map((entry) => (
            <motion.div
              key={entry.nodeId}
              layout
              initial={{ opacity: 0, scale: 0.85 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.85 }}
              transition={{ duration: 0.22 }}
              className="flex h-9 min-w-9 shrink-0 items-center justify-center border px-2 font-mono-num text-[12.5px] font-medium"
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
        <strong className="text-ink-muted">FIFO</strong> — First In, First Out. Primeiro a entrar, primeiro a sair.
      </p>
    </div>
  );
}
