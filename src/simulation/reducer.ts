import type { GraphProblem } from '../domain/types';
import { edgeBetween } from '../domain/graph';
import type { StepEvent } from './events';
import { createInitialState, type SimulationState } from './state';

/**
 * The single source of truth for how a `SimulationState` evolves. Pure:
 * given the same (state, event, problem), always produces the same new
 * state. Never mutates its inputs — every field that changes is replaced,
 * so old snapshots stay valid forever (this is what makes "step back"
 * free: it is just reading an earlier snapshot, never re-running anything).
 */
export function applyEvent(
  state: SimulationState,
  event: StepEvent,
  problem: GraphProblem,
): SimulationState {
  const next: SimulationState = {
    ...state,
    step: state.step + 1,
    discovered: { ...state.discovered },
    expanded: [...state.expanded],
    currentPath: [...state.currentPath],
    discardedEdges: [...state.discardedEdges],
    discardedNodes: [...state.discardedNodes],
    deadEnds: [...state.deadEnds],
    backtrackingEdge: undefined,
    backtrackingFrom: undefined,
  };

  switch (event.type) {
    case 'INIT': {
      next.discovered[event.start] = { g: 0, depth: 0 };
      next.frontier = [{ nodeId: event.start, g: 0, depth: 0, path: [event.start] }];
      break;
    }

    case 'SELECT_NODE': {
      const entry = state.frontier.find((e) => e.nodeId === event.node);
      next.frontier = state.frontier.filter((e) => e.nodeId !== event.node);
      next.currentNode = event.node;
      if (entry) {
        // The common case: BFS/DFS/backtracking/UCS/... all track path,
        // depth and g on their frontier entries — use them directly.
        next.currentPath = entry.path;
        next.depth = entry.depth;
        next.totalCost = entry.g;
      } else if (state.currentNode) {
        // No frontier entry to read from (e.g. irrevocable search keeps no
        // frontier at all) — fall back to extending the path by the single
        // edge just taken from the previous current node.
        const edge = edgeBetween(problem, state.currentNode, event.node);
        next.currentPath = [...state.currentPath, event.node];
        next.depth = state.depth + 1;
        next.totalCost = state.totalCost + (edge?.cost ?? 0);
      } else {
        // The very first selection of the run (the start node itself).
        next.currentPath = [event.node];
      }
      break;
    }

    case 'GOAL_TEST': {
      // Pure "pause and look" step — no persistent state changes. Kept as
      // its own snapshot so the player can stop here and the explanation
      // panel can narrate the check on its own.
      break;
    }

    case 'EXPAND_NODE': {
      next.expanded.push(event.node);
      break;
    }

    case 'DISCOVER_NODES': {
      for (const d of event.discoveries) {
        next.discovered[d.node] = { g: d.g, depth: d.depth, parent: state.currentNode, via: d.via };
      }
      break;
    }

    case 'ADD_TO_FRONTIER':
    case 'UPDATE_FRONTIER': {
      // Full replacement: the algorithm always supplies the complete,
      // correctly-ordered frontier (index 0 = next node to be selected),
      // so the reducer never has to guess where a new entry belongs.
      next.frontier = event.entries;
      // Keep the discovered-info record (used for the "visitados" set and
      // the WhyNot panel) in sync — matters for UPDATE_FRONTIER, where a
      // cheaper path just replaced a node's previously recorded g/parent.
      for (const entry of event.entries) {
        next.discovered[entry.nodeId] = { g: entry.g, depth: entry.depth, parent: entry.parentId, via: entry.viaEdge };
      }
      break;
    }

    case 'SKIP_NODE': {
      next.discardedEdges.push(event.via);
      // Poda por limite (IDA*): guardamos o f que estourou, porque é ele que
      // determina o limite da próxima iteração.
      if (event.reason === 'over-limit' && event.f !== undefined) {
        next.extra = {
          ...state.extra,
          overLimitNodes: [...(state.extra?.overLimitNodes ?? []), { node: event.node, f: event.f }],
        };
      }
      break;
    }

    case 'DEAD_END': {
      next.deadEnds.push(event.node);
      break;
    }

    case 'BACKTRACK': {
      const backEdge = edgeBetween(problem, event.to, event.from);
      if (backEdge) {
        next.backtrackingEdge = backEdge.id;
        next.discardedEdges.push(backEdge.id);
      }
      next.backtrackingFrom = event.from;
      next.discardedNodes.push(event.from);
      const cut = state.currentPath.indexOf(event.to);
      next.currentPath = cut >= 0 ? state.currentPath.slice(0, cut + 1) : state.currentPath;
      next.currentNode = event.to;
      const info = state.discovered[event.to];
      next.depth = info?.depth ?? state.depth;
      next.totalCost = info?.g ?? state.totalCost;
      break;
    }

    case 'ITERATION_END': {
      next.extra = { ...state.extra, nextLimit: event.nextLimit ?? undefined };
      break;
    }

    case 'ITERATION_START': {
      const fresh = createInitialState(state.frontierKind);
      Object.assign(next, fresh, {
        step: state.step + 1,
        extra: { limit: event.limit },
      });
      next.discovered[problem.start] = { g: 0, depth: 0 };
      next.frontier = [{ nodeId: problem.start, g: 0, depth: 0, path: [problem.start] }];
      break;
    }

    case 'SOLUTION_FOUND': {
      next.solutionPath = event.path;
      next.totalCost = event.cost;
      next.status = 'solved';
      break;
    }

    case 'FAILURE': {
      next.status = 'failed';
      break;
    }
  }

  next.metrics = {
    discovered: Object.keys(next.discovered).length,
    expanded: next.expanded.length,
    frontierSize: next.frontier.length,
    maxFrontierSize: Math.max(state.metrics.maxFrontierSize, next.frontier.length),
  };

  return next;
}
