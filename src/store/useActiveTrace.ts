import { useMemo } from 'react';
import { getGraph } from '../graphs';
import { getAlgorithm, isImplemented } from '../algorithms/registry';
import { getTrace } from '../simulation/buildTrace';
import { useSimulation } from './useSimulation';
import type { Trace } from '../simulation/types';
import type { GraphProblem } from '../domain/types';
import type { AlgorithmDefinition } from '../simulation/types';

export interface ActiveTraceResult {
  problem: GraphProblem;
  algorithm: AlgorithmDefinition;
  trace: Trace | null;
  stepIndex: number;
  maxIndex: number;
}

/**
 * Resolves the store's current graphId/algorithmId into an actual trace,
 * clamping the step index to valid bounds. The single place every view
 * (player, canvas, panels) goes through to read "what's happening right now".
 */
export function useActiveTrace(): ActiveTraceResult {
  const graphId = useSimulation((s) => s.graphId);
  const algorithmId = useSimulation((s) => s.algorithmId);
  const stepIndex = useSimulation((s) => s.stepIndex);

  const problem = getGraph(graphId) ?? getGraph('main')!;
  const algorithm = getAlgorithm(algorithmId) ?? getAlgorithm('bfs')!;

  const trace = useMemo(() => {
    if (!isImplemented(algorithm)) return null;
    return getTrace(problem, algorithm);
  }, [problem, algorithm]);

  const maxIndex = trace ? trace.steps.length - 1 : 0;
  const clampedIndex = Math.min(stepIndex, Math.max(maxIndex, 0));

  return { problem, algorithm, trace, stepIndex: clampedIndex, maxIndex };
}
