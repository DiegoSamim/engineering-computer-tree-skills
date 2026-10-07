import { useSimulation, type Tab } from '../../store/useSimulation';

const TABS: { id: Tab; label: string }[] = [
  { id: 'visualizacao', label: 'Visualização' },
  { id: 'teoria', label: 'Teoria' },
  { id: 'codigo', label: 'Código' },
  { id: 'comparacao', label: 'Comparação' },
];

export function LabTabs() {
  const activeTab = useSimulation((s) => s.activeTab);
  const setActiveTab = useSimulation((s) => s.setActiveTab);

  return (
    <div className="flex items-center gap-4 border-b border-line px-4">
      {TABS.map((tab) => {
        const active = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id)}
            className="relative py-2.5 text-[13px] font-medium transition-colors"
            style={{ color: active ? 'var(--text)' : 'var(--text-faint)' }}
          >
            {tab.label}
            {active && (
              <span className="absolute inset-x-0 -bottom-px h-[2px]" style={{ background: 'var(--color-accent)' }} />
            )}
          </button>
        );
      })}
    </div>
  );
}
