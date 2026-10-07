import { TOPIC_SECTIONS } from '../../content/topics/types';

interface Props {
  activeKey: string;
  doneKeys: string[];
  expanded: boolean;
  onToggle: () => void;
  onNavigate: (key: string) => void;
}

/** Ícone curto por seção — o que sobra quando o drawer está recolhido. */
const GLYPHS: Record<string, string> = {
  'visao-geral': '◈',
  intuicao: '◍',
  analogia: '◑',
  visualizacao: '▶',
  'quando-usar': '◎',
  complexidade: 'O',
  exemplos: '≡',
  codigo: '</>',
  'erros-comuns': '!',
  exercicios: '⌘',
  resumo: '§',
  revisao: '↻',
};

export function TopicDrawer({ activeKey, doneKeys, expanded, onToggle, onNavigate }: Props) {
  return (
    <nav
      className="flex shrink-0 flex-col overflow-y-auto border-r border-line transition-[width] duration-200"
      style={{ width: expanded ? 190 : 52 }}
      aria-label="Seções do tópico"
    >
      <button
        type="button"
        onClick={onToggle}
        aria-label={expanded ? 'Recolher menu' : 'Expandir menu'}
        title={expanded ? 'Recolher menu' : 'Expandir menu'}
        className="flex h-10 shrink-0 items-center gap-2.5 border-b border-line px-4 text-[13px] text-ink-faint transition-colors hover:text-ink"
      >
        <span aria-hidden="true">☰</span>
        {expanded && <span className="text-[11px] uppercase tracking-wide">Seções</span>}
      </button>

      <ul className="py-1">
        {TOPIC_SECTIONS.map((section) => {
          const active = section.key === activeKey;
          const done = doneKeys.includes(section.key);
          return (
            <li key={section.key}>
              <button
                type="button"
                onClick={() => onNavigate(section.key)}
                title={section.label}
                className="relative flex w-full items-center gap-2.5 px-4 py-1.5 text-left text-[12.5px] transition-colors"
                style={{ color: active ? 'var(--color-accent)' : done ? 'var(--text-muted)' : 'var(--text-faint)' }}
              >
                {active && (
                  <span className="absolute left-0 top-0 h-full w-[2px]" style={{ background: 'var(--color-accent)' }} />
                )}
                <span aria-hidden="true" className="w-4 shrink-0 text-center font-mono-num text-[10px]">
                  {done ? '✓' : GLYPHS[section.key]}
                </span>
                {expanded && <span className="truncate">{section.label}</span>}
              </button>
            </li>
          );
        })}
      </ul>

      <div className="mt-auto border-t border-line px-4 py-2.5">
        <span
          className="flex items-center gap-2.5 text-[12px] text-ink-faint opacity-50"
          title="Simulação de entrevista — em breve"
        >
          <span aria-hidden="true" className="w-4 shrink-0 text-center font-mono-num text-[10px]">
            ▣
          </span>
          {expanded && <span className="truncate">Simulação</span>}
        </span>
      </div>
    </nav>
  );
}
