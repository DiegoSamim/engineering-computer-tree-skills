import type { AlgorithmDefinition } from '../../simulation/types';

function Block({ title, code, mono = true }: { title: string; code: string; mono?: boolean }) {
  return (
    <section className="mb-7">
      <h3 className="mb-2 font-mono-num text-[11px] uppercase tracking-wide text-ink-faint">{title}</h3>
      <pre
        className={`overflow-x-auto border border-line bg-surface-sunken p-3.5 text-[12.5px] leading-relaxed text-ink-muted ${mono ? 'font-mono-num' : ''}`}
      >
        {code.trim()}
      </pre>
    </section>
  );
}

export function CodePanel({ algorithm }: { algorithm: AlgorithmDefinition }) {
  if (!algorithm.code) {
    return (
      <div className="flex h-full items-center justify-center px-6 text-center text-[13px] text-ink-faint">
        O código de {algorithm.name} ainda não foi escrito nesta versão.
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-[820px] px-8 py-7">
      <h2 className="mb-1 text-[20px] font-semibold tracking-tight text-ink">{algorithm.name}</h2>
      <p className="mb-7 text-[13px] text-ink-muted">{algorithm.shortSummary}</p>
      <Block title="Pseudocódigo" code={algorithm.code.pseudocode} />
      <Block title="TypeScript" code={algorithm.code.typescript} />
    </div>
  );
}
