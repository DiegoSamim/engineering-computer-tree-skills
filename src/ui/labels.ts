import type { ContentStatus, Difficulty, NodeKind, NodeState } from '../domain/tree/types';

/** Textos de interface: estados em uma palavra, direto. */

export const STATE_LABEL: Record<NodeState, string> = {
  dominado: 'Dominado',
  em_progresso: 'Em progresso',
  estudando: 'Estudando',
  disponivel: 'Disponível',
  bloqueado: 'Bloqueado',
};

export const KIND_LABEL: Record<NodeKind, string> = {
  padrao: 'Padrão',
  conceito: 'Conceito',
  ferramenta: 'Ferramenta',
  caso: 'Caso de design',
};

export const CONTENT_LABEL: Record<ContentStatus, string> = {
  publicado: 'conteúdo publicado',
  rascunho: 'rascunho',
  planejado: 'sem conteúdo ainda',
};

export const DIFFICULTY_LABEL: Record<Difficulty, string> = {
  facil: 'Fácil',
  medio: 'Médio',
  dificil: 'Difícil',
};
