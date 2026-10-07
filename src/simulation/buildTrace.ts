import type { GraphProblem } from '../domain/types';
import { optimalSolutionCost } from '../domain/graph';
import { applyEvent } from './reducer';
import { createInitialState } from './state';
import type { AlgorithmDefinition, Step, Trace } from './types';

/**
 * Runs an algorithm to completion up front, producing every snapshot at
 * once. Stepping through the simulation later — forward, backward, or by
 * jumping to an arbitrary step — is then just indexing into this array.
 * Nothing is ever re-executed, which is what keeps forward/backward
 * navigation perfectly consistent.
 */
export function buildTrace(problem: GraphProblem, algorithm: AlgorithmDefinition): Trace {
  if (!algorithm.run || !algorithm.narrate) {
    throw new Error(`Algorithm "${algorithm.id}" has no run/narrate — it is theory-only.`);
  }

  const steps: Step[] = [];
  let state = createInitialState(algorithm.frontierKind);

  for (const event of algorithm.run(problem)) {
    const prev = state;
    const nextState = applyEvent(prev, event, problem);
    const narration = algorithm.narrate(event, prev, nextState, problem);
    steps.push({ event, state: nextState, narration });
    state = nextState;
  }

  const final = state;
  const optimalCost = optimalSolutionCost(problem);
  const summary: Trace['summary'] = {
    found: final.status === 'solved',
    solutionPath: final.solutionPath,
    cost: final.solutionPath ? final.totalCost : undefined,
    pathEdges: final.solutionPath ? final.solutionPath.length - 1 : undefined,
    discovered: final.metrics.discovered,
    expanded: final.metrics.expanded,
    maxFrontierSize: final.metrics.maxFrontierSize,
    optimalCost,
    isOptimal:
      final.status === 'solved' && optimalCost !== undefined ? final.totalCost === optimalCost : undefined,
  };

  return { steps, summary };
}

/** Cache keyed by `${graphId}:${algorithmId}` — traces are cheap but not free, and stable. */
const traceCache = new Map<string, Trace>();

export function getTrace(problem: GraphProblem, algorithm: AlgorithmDefinition): Trace {
  const key = `${problem.id}:${algorithm.id}`;
  const cached = traceCache.get(key);
  if (cached) return cached;
  const trace = buildTrace(problem, algorithm);
  traceCache.set(key, trace);
  return trace;
}
