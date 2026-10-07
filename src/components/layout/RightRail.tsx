import type { NodeId } from '../../domain/types';
import type { Step, TraceSummary } from '../../simulation/types';
import { StepExplanation } from '../../player/StepExplanation';
import { ConceptCard } from '../panels/ConceptCard';
import { WhyNotPanel } from '../panels/WhyNotPanel';
import { FrontierView } from '../frontier/FrontierView';
import { MetricsPanel } from '../panels/MetricsPanel';

interface Props {
  step: Step;
  stepIndex: number;
  maxIndex: number;
  summary: TraceSummary;
  whyNotNodeId: NodeId | null;
  onCloseWhyNot: () => void;
}

export function RightRail({ step, stepIndex, maxIndex, summary, whyNotNodeId, onCloseWhyNot }: Props) {
  return (
    <aside className="flex h-full flex-col overflow-y-auto border-l border-line" aria-label="Explicação e métricas">
      <StepExplanation narration={step.narration} stepIndex={stepIndex} maxIndex={maxIndex} />
      {whyNotNodeId && <WhyNotPanel state={step.state} nodeId={whyNotNodeId} onClose={onCloseWhyNot} />}
      <ConceptCard conceptId={step.narration.concept} />
      <FrontierView state={step.state} />
      <MetricsPanel state={step.state} summary={summary} />
    </aside>
  );
}
