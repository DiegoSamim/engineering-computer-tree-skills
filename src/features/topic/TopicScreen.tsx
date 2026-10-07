import { useCallback, useEffect, useRef, useState } from 'react';
import { Link, Navigate, useParams } from 'react-router-dom';
import { getTopicContent } from '../../content/topics/registry';
import { TOPIC_SECTIONS } from '../../content/topics/types';
import { getSection, getTopic, PRIORITY_COLOR, PRIORITY_LABEL } from '../../content/roadmap';
import { useProgress, useTopicProgress } from '../../store/useProgress';
import { TopicDrawer } from './TopicDrawer';
import { TopicRail } from './TopicRail';
import {
  AnalogySection, BulletList, CodeSection, ComplexitySection, ExamplesSection, ExercisesSection,
  Paragraphs, ReviewSection, TopicSection, VisualizerSection, WhenSection,
} from './TopicSections';

export function TopicScreen() {
  const { topicId } = useParams<{ topicId: string }>();
  const content = topicId ? getTopicContent(topicId) : undefined;
  const meta = topicId ? getTopic(topicId) : undefined;

  const progress = useTopicProgress(topicId ?? '');
  const dispatch = useProgress((s) => s.dispatch);

  const [expanded, setExpanded] = useState(true);
  const [activeKey, setActiveKey] = useState(TOPIC_SECTIONS[0].key);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Scroll-spy: highlights whichever section is nearest the top of the pane.
  useEffect(() => {
    const root = scrollRef.current;
    if (!root) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)[0];
        if (visible) setActiveKey(visible.target.getAttribute('data-section') ?? activeKey);
      },
      { root, rootMargin: '0px 0px -70% 0px', threshold: 0 },
    );

    root.querySelectorAll('[data-section]').forEach((el) => observer.observe(el));
    return () => observer.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [content]);

  const navigateTo = useCallback((key: string) => {
    const el = scrollRef.current?.querySelector(`#sec-${key}`);
    el?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    setActiveKey(key);
  }, []);

  const toggleSectionDone = useCallback(
    (key: string) => {
      if (!topicId) return;
      const done = progress.sectionsDone.includes(key);
      void dispatch({
        type: done ? 'TOPIC_SECTION_UNCOMPLETED' : 'TOPIC_SECTION_COMPLETED',
        topicId,
        sectionKey: key,
      });
    },
    [dispatch, progress.sectionsDone, topicId],
  );

  if (!topicId) return <Navigate to="/roadmap" replace />;

  if (!content) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-3 px-6 text-center">
        <p className="text-[14px] text-ink-muted">
          {meta ? `O conteúdo de ${meta.name} ainda não foi escrito.` : 'Tópico não encontrado.'}
        </p>
        <Link to="/roadmap" className="text-[13px]" style={{ color: 'var(--color-accent)' }}>
          ← Voltar ao roadmap
        </Link>
      </div>
    );
  }

  const section = meta ? getSection(meta.sectionId) : undefined;
  const done = (key: string) => progress.sectionsDone.includes(key);
  const sectionProps = (key: string) => ({
    id: key,
    title: TOPIC_SECTIONS.find((s) => s.key === key)!.label,
    done: done(key),
    onToggleDone: () => toggleSectionDone(key),
  });

  return (
    <div className="flex h-full">
      <TopicDrawer
        activeKey={activeKey}
        doneKeys={progress.sectionsDone}
        expanded={expanded}
        onToggle={() => setExpanded((v) => !v)}
        onNavigate={navigateTo}
      />

      <div ref={scrollRef} className="min-w-0 flex-1 overflow-y-auto">
        <header className="px-8 pb-6 pt-6">
          <nav className="mb-4 flex items-center gap-1.5 text-[11.5px] text-ink-faint">
            <Link to="/roadmap" className="transition-colors hover:text-ink-muted">
              Roadmap
            </Link>
            {section && (
              <>
                <span aria-hidden="true">›</span>
                <span>
                  {section.level !== undefined ? `Nível ${section.level} · ` : ''}
                  {section.title}
                </span>
              </>
            )}
            <span aria-hidden="true">›</span>
            <span className="text-ink-muted">{content.name}</span>
          </nav>

          <div className="flex items-center gap-3">
            <span
              className="flex h-10 w-10 items-center justify-center border text-[19px]"
              style={{ borderColor: 'var(--color-accent-border)', color: 'var(--color-accent)' }}
              aria-hidden="true"
            >
              {content.glyph}
            </span>
            <h1 className="text-[27px] font-semibold tracking-tight text-ink">{content.name}</h1>
            {meta && (
              <span
                className="font-mono-num text-[10px] uppercase tracking-[0.12em]"
                style={{ color: PRIORITY_COLOR[meta.priority] }}
              >
                {PRIORITY_LABEL[meta.priority]}
              </span>
            )}
          </div>

          <p className="mt-2.5 max-w-[680px] text-[14px] leading-relaxed text-ink-muted">{content.tagline}</p>

          <div className="mt-3.5 flex flex-wrap gap-1.5">
            {content.badges.map((b) => (
              <span
                key={b}
                className="border px-2 py-0.5 text-[10.5px] text-ink-faint"
                style={{ borderColor: 'var(--border)' }}
              >
                {b}
              </span>
            ))}
          </div>
        </header>

        <TopicSection {...sectionProps('visao-geral')}>
          <Paragraphs items={content.whatIsIt} />
        </TopicSection>

        <TopicSection {...sectionProps('intuicao')}>
          <Paragraphs items={content.intuition} />
        </TopicSection>

        <TopicSection {...sectionProps('analogia')}>
          <AnalogySection content={content} />
        </TopicSection>

        <TopicSection {...sectionProps('visualizacao')}>
          <VisualizerSection content={content} />
        </TopicSection>

        <TopicSection {...sectionProps('quando-usar')}>
          <WhenSection content={content} />
        </TopicSection>

        <TopicSection {...sectionProps('complexidade')}>
          <ComplexitySection content={content} />
        </TopicSection>

        <TopicSection {...sectionProps('exemplos')}>
          <ExamplesSection content={content} />
        </TopicSection>

        <TopicSection {...sectionProps('codigo')}>
          <CodeSection content={content} />
        </TopicSection>

        <TopicSection {...sectionProps('erros-comuns')}>
          <BulletList items={content.commonMistakes} marker="!" color="var(--color-state-danger)" />
        </TopicSection>

        <TopicSection {...sectionProps('exercicios')}>
          <ExercisesSection
            content={content}
            doneIds={progress.exercisesDone}
            onToggle={(id, isDone) =>
              void dispatch({ type: 'EXERCISE_MARKED', topicId, exerciseId: id, done: isDone })
            }
          />
        </TopicSection>

        <TopicSection {...sectionProps('resumo')}>
          <BulletList items={content.summary} marker="—" color="var(--color-accent)" />
        </TopicSection>

        <TopicSection {...sectionProps('revisao')}>
          <ReviewSection content={content} />
        </TopicSection>

        <div className="h-16" />
      </div>

      <TopicRail content={content} />
    </div>
  );
}
