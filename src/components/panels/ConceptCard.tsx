import { getConcept } from '../../content/concepts';

interface Props {
  conceptId?: string;
}

export function ConceptCard({ conceptId }: Props) {
  const concept = getConcept(conceptId);
  if (!concept) return null;

  return (
    <section className="border-b border-line px-4 py-3.5">
      <div className="mb-1.5 font-mono-num text-[11px] uppercase tracking-wide text-ink-faint">
        Entenda este conceito
      </div>
      <h4 className="mb-1 text-[13px] font-semibold text-ink">{concept.term}</h4>
      <p className="text-[12.5px] leading-relaxed text-ink-muted">{concept.definition}</p>
    </section>
  );
}
