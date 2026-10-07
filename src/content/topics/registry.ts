import type { TopicContent } from './types';
import { twoPointers } from './two-pointers';

export const TOPIC_CONTENT: Record<string, TopicContent> = {
  'two-pointers': twoPointers,
};

export function getTopicContent(id: string): TopicContent | undefined {
  return TOPIC_CONTENT[id];
}
