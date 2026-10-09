import { useState } from 'react';
import type { NodeStateView } from '../../../domain/tree/api';
import type { GuideId } from '../../../domain/tree/guides';
import type { NodeDef } from '../../../domain/tree/types';
import type { TopicContent } from '../../../content/topics/types';
import { useToast } from '../../../store/useToast';
import { Check } from '../../../ui/controls';
import { DIFFICULTY_LABEL } from '../../../ui/labels';
import { renderVisualizer } from '../../../visualizers/registry';
import { highlight } from './highlight';

interface Props {
  id: GuideId;
  content: TopicContent;
  node: NodeDef;
  progress: NodeStateView | undefined;
  onSolve: (exercise: string) => void;
}

/** O corpo de uma guia. O texto vem do TS do nó; exercícios e visualizador, do catálogo. */
export function GuideBody({ id, content, node, progress, onSolve }: Props) {
  switch (id) {
    case 'visao-geral':
      return <Prose paragraphs={content.whatIsIt} />;
    case 'intuicao':
      return <Prose paragraphs={content.intuition} />;
    case 'analogia':
      return (
        <div className="callout">
          <h3>{content.analogy.title}</h3>
          <p>{content.analogy.text}</p>
        </div>
      );
    case 'visualizacao':
      return <Visualization visualizer={node.visualizer} />;
    case 'quando-usar':
      return (
        <div className="two">
          <div className="yes">
            <h3>Use quando</h3>
            <List items={content.whenToUse} />
          </div>
          <div className="not">
            <h3>Evite quando</h3>
            <List items={content.whenNotToUse} />
          </div>
        </div>
      );
    case 'complexidade':
      return (
        <div className="bigo">
          <div>
            <div className="v">{content.complexity.time}</div>
            <div className="l">Tempo</div>
            <p>{content.complexity.timeNote}</p>
          </div>
          <div>
            <div className="v">{content.complexity.space}</div>
            <div className="l">Espaço</div>
            <p>{content.complexity.spaceNote}</p>
          </div>
        </div>
      );
    case 'exemplos':
      return <Examples examples={content.examples} />;
    case 'codigo':
      return <Code language={content.template.language} code={content.template.code} />;
    case 'erros-comuns':
      return <List items={content.commonMistakes} className="warn" />;
    case 'exercicios':
      return <Exercises node={node} why={content.exerciseWhy} progress={progress} onSolve={onSolve} />;
    case 'resumo':
      return <List items={content.summary} className="yes" />;
    case 'revisao':
      return <Review items={content.review} />;
  }
}

function Prose({ paragraphs }: { paragraphs: string[] }) {
  return (
    <div className="prose">
      {paragraphs.map((p, i) => (
        <p key={i}>{p}</p>
      ))}
    </div>
  );
}

function List({ items, className = '' }: { items: string[]; className?: string }) {
  return (
    <ul className={`list ${className}`}>
      {items.map((item, i) => (
        <li key={i}>{item}</li>
      ))}
    </ul>
  );
}

function Visualization({ visualizer }: { visualizer?: string }) {
  return renderVisualizer(visualizer) ?? <p className="guide-note">Este nó ainda não tem visualização.</p>;
}

function Examples({ examples }: { examples: TopicContent['examples'] }) {
  const [current, setCurrent] = useState(0);
  const example = examples[current];
  return (
    <>
      <div className="seg" role="tablist" aria-label="Exemplos">
        {examples.map((e, i) => (
          <button
            key={e.title}
            type="button"
            role="tab"
            aria-selected={i === current}
            className={i === current ? 'on' : ''}
            onClick={() => setCurrent(i)}
          >
            {e.title}
          </button>
        ))}
      </div>
      <div className="ex-input">{example.input}</div>
      <ol className="walk">
        {example.walkthrough.map((step, i) => (
          <li key={i}>
            <span>{step}</span>
          </li>
        ))}
      </ol>
    </>
  );
}

function Code({ language, code }: { language: string; code: string }) {
  const show = useToast((s) => s.show);
  const copy = () => {
    navigator.clipboard?.writeText(code).then(
      () => show('Código copiado'),
      () => show('Selecione o código para copiar'),
    );
  };
  return (
    <div className="code">
      <div className="bar">
        <span>{language}</span>
        <button type="button" onClick={copy}>
          Copiar
        </button>
      </div>
      <pre>
        <code>
          {highlight(code).map((t, i) =>
            t.kind ? (
              <span key={i} className={t.kind}>
                {t.text}
              </span>
            ) : (
              t.text
            ),
          )}
        </code>
      </pre>
    </div>
  );
}

function Exercises({
  node,
  why,
  progress,
  onSolve,
}: {
  node: NodeDef;
  why: Record<string, string>;
  progress: NodeStateView | undefined;
  onSolve: (exercise: string) => void;
}) {
  if (node.exercises.length === 0) return <p className="guide-note">Nenhum exercício cadastrado ainda.</p>;
  return (
    <ul className="exs">
      {node.exercises.map((e) => {
        const solved = Boolean(progress?.exercises[e.id]?.solvedAt);
        return (
          <li key={e.id}>
            <button
              type="button"
              aria-pressed={solved}
              disabled={solved}
              aria-label={solved ? `${e.title}: resolvido` : `Marcar ${e.title} como resolvido`}
              onClick={() => onSolve(e.id)}
            >
              <Check on={solved} />
            </button>
            <div>
              {e.url ? (
                <a href={e.url} target="_blank" rel="noopener noreferrer">
                  {e.title}
                </a>
              ) : (
                <span>{e.title}</span>
              )}
              {why[e.id] && <p>{why[e.id]}</p>}
            </div>
            {e.difficulty && <span className="diff">{DIFFICULTY_LABEL[e.difficulty]}</span>}
          </li>
        );
      })}
    </ul>
  );
}

function Review({ items }: { items: TopicContent['review'] }) {
  const [open, setOpen] = useState<ReadonlySet<number>>(new Set());
  const toggle = (i: number) =>
    setOpen((s) => {
      const next = new Set(s);
      if (next.has(i)) next.delete(i);
      else next.add(i);
      return next;
    });
  return (
    <div className="cards">
      {items.map((item, i) => (
        <button
          key={item.question}
          type="button"
          className={`flash ${open.has(i) ? 'open' : ''}`}
          aria-expanded={open.has(i)}
          onClick={() => toggle(i)}
        >
          <div className="q">{item.question}</div>
          <div className="hintx">Responda mentalmente, depois toque para conferir.</div>
          <div className="a">
            <div>{item.answer}</div>
          </div>
        </button>
      ))}
    </div>
  );
}
