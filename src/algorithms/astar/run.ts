import type { GraphProblem, NodeId } from '../../domain/types';
import { heuristicOf, isGoal } from '../../domain/graph';
import type { FrontierEntry, StepEvent } from '../../simulation/events';
import { createSequencer, expandSuccessors, sortByPriority, toDiscoveryDescriptors } from '../_shared/frontier';

const keyOf = (e: FrontierEntry) => e.f ?? e.g;

/**
 * A*. Fila de prioridade ordenada por f(n) = g(n) + h(n): o custo já pago mais
 * a estimativa do que falta.
 *
 * É a síntese das duas buscas anteriores — o Custo Uniforme só olha g, e a
 * Gulosa só olha h. Somar os dois é o que permite ser guiado pela heurística
 * sem perder a otimalidade, desde que h seja admissível.
 *
 * Teste de objetivo na expansão (ao retirar da fronteira), nunca na geração:
 * é isso que dá tempo de um caminho mais barato aparecer antes de fechar a
 * resposta — exatamente o que acontece com G neste grafo.
 */
export function* run(problem: GraphProblem): Generator<StepEvent> {
  yield { type: 'INIT', start: problem.start };

  const seq = createSequencer();
  const bestG = new Map<NodeId, number>([[problem.start, 0]]);

  const h0 = heuristicOf(problem, problem.start);
  let frontier: FrontierEntry[] = [
    { nodeId: problem.start, g: 0, h: h0, f: h0, depth: 0, path: [problem.start], seq: seq() },
  ];

  while (frontier.length > 0) {
    const candidates = frontier.map((e) => ({ id: e.nodeId, value: e.f ?? e.g }));
    const entry = frontier[0];
    frontier = frontier.slice(1);

    yield { type: 'SELECT_NODE', node: entry.nodeId, reason: { kind: 'min', metric: 'f', chosen: entry.nodeId, candidates } };

    const goal = isGoal(problem, entry.nodeId);
    yield { type: 'GOAL_TEST', node: entry.nodeId, isGoal: goal, when: 'expansion' };
    if (goal) {
      yield { type: 'SOLUTION_FOUND', path: entry.path, cost: entry.g };
      return;
    }

    const successorEntries = expandSuccessors(problem, entry).map((e) => {
      const h = heuristicOf(problem, e.nodeId);
      return { ...e, h, f: e.g + h, seq: seq() };
    });
    yield { type: 'EXPAND_NODE', node: entry.nodeId, successors: successorEntries.map((e) => e.nodeId) };

    if (successorEntries.length === 0) {
      yield { type: 'DEAD_END', node: entry.nodeId };
      continue;
    }

    const fresh: FrontierEntry[] = [];
    const improved: FrontierEntry[] = [];
    for (const s of successorEntries) {
      const known = bestG.get(s.nodeId);
      if (known === undefined) {
        bestG.set(s.nodeId, s.g);
        fresh.push(s);
      } else if (s.g < known) {
        // Caminho mais barato até um nó já conhecido: f cai junto com g.
        bestG.set(s.nodeId, s.g);
        improved.push(s);
      } else {
        yield { type: 'SKIP_NODE', node: s.nodeId, via: s.viaEdge!, reason: 'worse-path' };
      }
    }

    if (fresh.length > 0) {
      yield { type: 'DISCOVER_NODES', discoveries: toDiscoveryDescriptors(fresh) };
      frontier = sortByPriority([...frontier, ...fresh], keyOf);
      yield { type: 'ADD_TO_FRONTIER', entries: frontier };
    }

    if (improved.length > 0) {
      const improvedIds = new Set(improved.map((e) => e.nodeId));
      frontier = sortByPriority([...frontier.filter((e) => !improvedIds.has(e.nodeId)), ...improved], keyOf);
      yield { type: 'UPDATE_FRONTIER', entries: frontier };
    }
  }

  yield { type: 'FAILURE', reason: 'A fronteira ficou vazia sem encontrar o objetivo.' };
}
