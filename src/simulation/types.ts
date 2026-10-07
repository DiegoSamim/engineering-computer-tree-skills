import type { GraphProblem, NodeId } from '../domain/types';
import type { StepEvent } from './events';
import type { FrontierKind, SimulationState } from './state';

/** The pedagogical content attached to a single step. */
export interface Narration {
  title: string;
  text: string;
  /** Key into content/concepts.ts — drives the contextual "Entenda este conceito" card. */
  concept?: string;
}

export interface Step {
  event: StepEvent;
  state: SimulationState;
  narration: Narration;
}

export interface TraceSummary {
  found: boolean;
  solutionPath?: NodeId[];
  cost?: number;
  pathEdges?: number;
  discovered: number;
  expanded: number;
  maxFrontierSize: number;
  /** Ground-truth cheapest cost to any goal, for the "solução ótima?" metric. */
  optimalCost?: number;
  isOptimal?: boolean;
}

export interface Trace {
  steps: Step[];
  summary: TraceSummary;
}

export interface AlgorithmTheory {
  idea: string;
  decisionRule: string;
  dataStructure: string;
  complete: string;
  optimal: string;
  timeComplexity: string;
  spaceComplexity: string;
  advantages: string[];
  disadvantages: string[];
  whenToUse: string;
  commonMistakes: string[];
}

export interface AlgorithmDefinition {
  id: string;
  name: string;
  shortSummary: string;
  frontierKind: FrontierKind;
  /** Implemented algorithms provide a generator; stubs (theory-only) omit it. */
  run?: (problem: GraphProblem) => Generator<StepEvent>;
  narrate?: (
    event: StepEvent,
    prev: SimulationState,
    next: SimulationState,
    problem: GraphProblem,
  ) => Narration;
  theory: AlgorithmTheory;
  /** Reference implementation shown in the lab's "Código" tab. */
  code?: { pseudocode: string; typescript: string };
}
