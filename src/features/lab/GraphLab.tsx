import { useState } from 'react';
import { Link } from 'react-router-dom';
import type { NodeId } from '../../domain/types';
import { useSimulation } from '../../store/useSimulation';
import { useActiveTrace } from '../../store/useActiveTrace';
import { useSimulationPlayer } from '../../player/useSimulationPlayer';
import { PlayerControls } from '../../player/PlayerControls';
import { Timeline } from '../../player/Timeline';
import { Sidebar } from '../../components/layout/Sidebar';
import { RightRail } from '../../components/layout/RightRail';
import { GraphCanvas } from '../../components/graph/GraphCanvas';
import { GraphLegend } from '../../components/graph/GraphLegend';
import { TheoryPanel } from '../../components/panels/TheoryPanel';
import { CompareLayout } from '../../components/compare/CompareLayout';
import { LabTabs } from './LabTabs';
import { CodePanel } from './CodePanel';

/**
 * The graph search laboratory — the original visualizer, now one module of
 * the platform rather than the whole app. Planned to become the Nível 7
 * roadmap topic later; for now it lives on its own route.
 */
export function GraphLab() {
  const activeTab = useSimulation((s) => s.activeTab);
  const { problem, algorithm, trace, stepIndex, maxIndex } = useActiveTrace();
  const [whyNotNodeId, setWhyNotNodeId] = useState<NodeId | null>(null);
  const player = useSimulationPlayer(trace ? maxIndex : 0);

  const handleNodeClick = (nodeId: NodeId) => {
    if (!trace) return;
    const state = trace.steps[stepIndex].state;
    const inFrontier = state.frontier.some((e) => e.nodeId === nodeId);
    setWhyNotNodeId(inFrontier ? nodeId : null);
  };

  const showRail = activeTab === 'visualizacao' && trace;

  return (
    <div className="grid h-full grid-cols-[260px_1fr_360px]">
      <Sidebar />

      <main className="flex min-w-0 flex-col overflow-hidden">
        <div className="flex items-center justify-between border-b border-line px-4 py-2">
          <Link to="/roadmap" className="text-[12px] text-ink-faint transition-colors hover:text-ink-muted">
            ← Voltar ao roadmap
          </Link>
          <span className="text-[11px] text-ink-faint">
            Laboratório · será integrado como tópico do Nível 7
          </span>
        </div>

        <LabTabs />

        {activeTab === 'comparacao' ? (
          <CompareLayout />
        ) : activeTab === 'teoria' ? (
          <div className="flex-1 overflow-y-auto">
            <TheoryPanel algorithm={algorithm} />
          </div>
        ) : activeTab === 'codigo' ? (
          <div className="flex-1 overflow-y-auto">
            <CodePanel algorithm={algorithm} />
          </div>
        ) : !trace ? (
          <div className="flex flex-1 items-center justify-center px-6 text-center text-[13px] text-ink-faint">
            {algorithm.name} ainda não está implementado nesta versão — confira a aba Teoria enquanto isso.
          </div>
        ) : (
          <>
            <div className="min-h-0 flex-1">
              <GraphCanvas problem={problem} state={trace.steps[stepIndex].state} onNodeClick={handleNodeClick} />
            </div>
            <div className="px-4 py-1.5 text-center text-[11px] text-ink-faint">
              Clique em um nó da fronteira para perguntar "por que não este?"
            </div>
            <GraphLegend />
            <Timeline trace={trace} player={player} />
            <PlayerControls player={player} />
          </>
        )}
      </main>

      {showRail ? (
        <RightRail
          step={trace.steps[stepIndex]}
          stepIndex={stepIndex}
          maxIndex={maxIndex}
          summary={trace.summary}
          whyNotNodeId={whyNotNodeId}
          onCloseWhyNot={() => setWhyNotNodeId(null)}
        />
      ) : (
        <div className="border-l border-line" />
      )}
    </div>
  );
}
