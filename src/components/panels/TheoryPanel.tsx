import type { AlgorithmDefinition } from '../../simulation/types';

interface Props {
  algorithm: AlgorithmDefinition;
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="border-b border-line py-4">
      <h4 className="mb-1.5 font-mono-num text-[11px] uppercase tracking-wide text-ink-faint">{title}</h4>
      <div className="text-[13.5px] leading-relaxed text-ink">{children}</div>
    </div>
  );
}

function List({ items }: { items: string[] }) {
  return (
    <ul className="list-none space-y-1.5">
      {items.map((item, i) => (
        <li key={i} className="flex gap-2 text-[13px] leading-relaxed text-ink-muted">
          <span className="text-ink-faint">—</span>
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}

export function TheoryPanel({ algorithm }: Props) {
  const t = algorithm.theory;

  return (
    <div className="mx-auto max-w-2xl px-6 py-6">
      <h2 className="mb-1 text-xl font-semibold text-ink">{algorithm.name}</h2>
      <p className="mb-4 text-[13px] text-ink-muted">{algorithm.shortSummary}</p>

      <Section title="Ideia principal">{t.idea}</Section>
      <Section title="Como decide qual nó explorar">{t.decisionRule}</Section>
      <Section title="Estrutura de dados">{t.dataStructure}</Section>
      <div className="grid grid-cols-2 gap-x-6 border-b border-line py-4">
        <div>
          <h4 className="mb-1.5 font-mono-num text-[11px] uppercase tracking-wide text-ink-faint">Completude</h4>
          <p className="text-[13px] leading-relaxed text-ink-muted">{t.complete}</p>
        </div>
        <div>
          <h4 className="mb-1.5 font-mono-num text-[11px] uppercase tracking-wide text-ink-faint">Otimalidade</h4>
          <p className="text-[13px] leading-relaxed text-ink-muted">{t.optimal}</p>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-x-6 border-b border-line py-4">
        <div>
          <h4 className="mb-1.5 font-mono-num text-[11px] uppercase tracking-wide text-ink-faint">
            Complexidade de tempo
          </h4>
          <p className="font-mono-num text-[13px] leading-relaxed text-ink-muted">{t.timeComplexity}</p>
        </div>
        <div>
          <h4 className="mb-1.5 font-mono-num text-[11px] uppercase tracking-wide text-ink-faint">
            Complexidade de espaço
          </h4>
          <p className="font-mono-num text-[13px] leading-relaxed text-ink-muted">{t.spaceComplexity}</p>
        </div>
      </div>
      <Section title="Vantagens">
        <List items={t.advantages} />
      </Section>
      <Section title="Desvantagens">
        <List items={t.disadvantages} />
      </Section>
      <Section title="Quando usar">{t.whenToUse}</Section>
      <div className="py-4">
        <h4 className="mb-1.5 font-mono-num text-[11px] uppercase tracking-wide text-ink-faint">
          Erros comuns de interpretação
        </h4>
        <List items={t.commonMistakes} />
      </div>
    </div>
  );
}
