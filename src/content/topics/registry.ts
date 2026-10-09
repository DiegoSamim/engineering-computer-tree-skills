import type { TopicContent } from './types';
import { twoPointers } from './two-pointers';

/** Corpo das guias por slug do nó. Um nó `publicado` precisa estar aqui. */
const TOPIC_CONTENT: Record<string, TopicContent> = {
  'two-pointers': twoPointers,
};

export function getTopicContent(slug: string): TopicContent | undefined {
  return TOPIC_CONTENT[slug];
}
