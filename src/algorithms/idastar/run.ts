import type { GraphProblem, NodeId } from '../../domain/types';
import { heuristicOf, isGoal } from '../../domain/graph';
import type { FrontierEntry, StepEvent } from '../../simulation/events';
import { expandSuccessors, toDiscoveryDescriptors } from '../_shared/frontier';

interface SearchResult {
  found: boolean;
  /** Menor f(n) que ultrapassou o limite nesta subárvore — Infinity se nenhum. */
  nextLimit: number;
}

function entryFor(problem: GraphProblem, base: FrontierEntry): FrontierEntry {
  const h = heuristicOf(problem, base.nodeId);
  return { ...base, h, f: base.g + h };
}

/**
 * IDA* — busca em profundidade repetida, com um limite de f(n) que cresce a
 * cada iteração.
 *
 * O A* guarda a fronteira inteira na memória; o IDA* guarda só o caminho
 * atual. O preço é refazer trabalho: cada iteração recomeça do zero. A troca
 * compensa porque o número de nós cresce exponencialmente com a profundidade,
 * então a última iteração domina o custo — repetir as anteriores é barato.
 *
 * O limite nunca é chutado: começa em h(início) e, a cada rodada, vira o MENOR
 * f que ultrapassou o limite anterior. É isso que preserva a otimalidade — não
 * se pula nenhum valor de f possível.
 */
export function* run(problem: GraphProblem): Generator<StepEvent> {
  yield { type: 'INIT', start: problem.start };

  const root = entryFor(problem, { nodeId: problem.start, g: 0, depth: 0, path: [problem.start] });
  let limit = root.f!;

  while (true) {
    yield { type: 'ITERATION_START', limit };
    yield { type: 'ADD_TO_FRONTIER', entries: [root] };

    const result = yield* search(problem, root, limit, new Set([problem.start]));
    if (result.found) return;

    if (!Number.isFinite(result.nextLimit)) {
      yield { type: 'ITERATION_END', exhaustedLimit: limit, nextLimit: null };
      yield {
        type: 'FAILURE',
        reason: 'Nenhum nó ultrapassou o limite e o objetivo não foi encontrado — não há mais espaço de busca para explorar.',
      };
      return;
    }

    yield { type: 'ITERATION_END', exhaustedLimit: limit, nextLimit: result.nextLimit };
    limit = result.nextLimit;
  }
}

function* search(
  problem: GraphProblem,
  entry: FrontierEntry,
  limit: number,
  ancestry: Set<NodeId>,
): Generator<StepEvent, SearchResult> {
  yield {
    type: 'SELECT_NODE',
    node: entry.nodeId,
    reason: { kind: 'min', metric: 'f', chosen: entry.nodeId, candidates: [{ id: entry.nodeId, value: entry.f! }] },
  };

  const goal = isGoal(problem, entry.nodeId);
  yield { type: 'GOAL_TEST', node: entry.nodeId, isGoal: goal, when: 'expansion' };
  if (goal) {
    yield { type: 'SOLUTION_FOUND', path: entry.path, cost: entry.g };
    return { found: true, nextLimit: Number.POSITIVE_INFINITY };
  }

  const successors = expandSuccessors(problem, entry).map((e) => entryFor(problem, e));
  yield { type: 'EXPAND_NODE', node: entry.nodeId, successors: successors.map((e) => e.nodeId) };

  const valid: FrontierEntry[] = [];
  for (const s of successors) {
    if (ancestry.has(s.nodeId)) {
      yield { type: 'SKIP_NODE', node: s.nodeId, via: s.viaEdge!, reason: 'in-current-path' };
    } else {
      valid.push(s);
    }
  }

  if (valid.length === 0) {
    yield { type: 'DEAD_END', node: entry.nodeId };
    return { found: false, nextLimit: Number.POSITIVE_INFINITY };
  }

  yield { type: 'DISCOVER_NODES', discoveries: toDiscoveryDescriptors(valid) };

  const nextAncestry = new Set(ancestry);
  nextAncestry.add(entry.nodeId);

  let smallestOverLimit = Number.POSITIVE_INFINITY;

  // Ordem de declaração, um sucessor por vez — igual à DFS recursiva clássica.
  for (let i = 0; i < valid.length; i++) {
    const candidate = valid[i];

    if (candidate.f! > limit) {
      // Não é descarte definitivo: este f é justamente o que pode virar o
      // limite da próxima iteração, quando o nó será explorado.
      yield { type: 'SKIP_NODE', node: candidate.nodeId, via: candidate.viaEdge!, reason: 'over-limit', f: candidate.f };
      smallestOverLimit = Math.min(smallestOverLimit, candidate.f!);
      continue;
    }

    yield { type: 'ADD_TO_FRONTIER', entries: valid.slice(i) };

    const result = yield* search(problem, candidate, limit, nextAncestry);
    if (result.found) return result;

    smallestOverLimit = Math.min(smallestOverLimit, result.nextLimit);
    yield { type: 'BACKTRACK', from: candidate.nodeId, to: entry.nodeId };
  }

  return { found: false, nextLimit: smallestOverLimit };
}
