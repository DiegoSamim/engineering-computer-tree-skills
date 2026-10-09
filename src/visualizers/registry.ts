import { createElement, type ComponentType, type ReactElement } from 'react';
import { DecompositionVisualizer } from './decomposicao/DecompositionVisualizer';
import { TwoPointersVisualizer } from './twoPointers/TwoPointersVisualizer';

/**
 * Visualizadores por chave. A chave vem do campo `visualizer` do YAML do nó;
 * a página do nó procura aqui, nunca num if. Os algoritmos do lab de grafos
 * (BFS, DFS, A*...) entram aqui na Fase 6.
 */
const VISUALIZERS: Record<string, ComponentType> = {
  'two-pointers': TwoPointersVisualizer,
  decomposicao: DecompositionVisualizer,
};

/** O visualizador do nó, ou null se a chave não existe no registry. */
export function renderVisualizer(key: string | undefined): ReactElement | null {
  const component = key ? VISUALIZERS[key] : undefined;
  return component ? createElement(component) : null;
}
