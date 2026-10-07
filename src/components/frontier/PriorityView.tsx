import { motion, AnimatePresence } from 'framer-motion';
import type { FrontierEntry } from '../../simulation/events';

interface Props {
  entries: FrontierEntry[];
}

/** Ordered priority-queue view for UCS / Greedy / A* — ready for when they land. */
export function PriorityView({ entries }: Props) {
  const showH = entries.some((e) => e.h !== undefined);
  const showF = entries.some((e) => e.f !== undefined);

  return (
    <div>
      <div className="mb-2 font-mono-num text-[10.5px] uppercase tracking-wide text-ink-faint">
        Fronteira ordenada
      </div>
      <div className="flex min-h-[40px] flex-col gap-1">
        <AnimatePresence initial={false} mode="popLayout">
          {entries.length === 0 && <span className="text-[12px] text-ink-faint">vazia</span>}
          {entries.map((entry) => (
            <motion.div
              key={entry.nodeId}
              layout
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex items-center justify-between border px-2.5 py-1 font-mono-num text-[12px]"
              style={{
                borderColor: 'var(--color-state-frontier)',
                color: 'var(--color-state-frontier)',
                background: 'color-mix(in srgb, var(--color-state-frontier) 10%, var(--bg-raised))',
              }}
            >
              <span className="font-semibold">{entry.nodeId}</span>
              <span className="flex gap-2 text-ink-muted">
                <span>g={entry.g}</span>
                {showH && <span>h={entry.h}</span>}
                {showF && <span>f={entry.f}</span>}
              </span>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}
