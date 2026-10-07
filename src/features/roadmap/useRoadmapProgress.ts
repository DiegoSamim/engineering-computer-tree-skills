import { useMemo } from 'react';
import { useProgress } from '../../store/useProgress';
import { SECTIONS, TOPICS, topicsOf } from '../../content/roadmap';
import type { TopicStatus } from '../../data/types';

export interface SectionStats {
  done: number;
  total: number;
  ratio: number;
}

export interface RoadmapStats {
  concluded: number;
  studying: number;
  notStarted: number;
  total: number;
  /**
   * Progresso ponderado pela distribuição de esforço sugerida (§02 do
   * roadmap) em vez de "% de tópicos". Concluir um tópico de cauda longa
   * não pode valer o mesmo que concluir Arrays/Strings.
   */
  roiPercent: number;
  bySection: Record<string, SectionStats>;
}

export function useRoadmapProgress(): RoadmapStats {
  const topics = useProgress((s) => s.snapshot.topics);

  return useMemo(() => {
    const statusOf = (id: string): TopicStatus => topics[id]?.status ?? 'nao-iniciado';

    let concluded = 0;
    let studying = 0;
    for (const t of TOPICS) {
      const status = statusOf(t.id);
      if (status === 'concluido') concluded++;
      else if (status === 'em-estudo') studying++;
    }

    const bySection: Record<string, SectionStats> = {};
    let weightedSum = 0;
    let weightTotal = 0;

    for (const section of SECTIONS) {
      const list = topicsOf(section.id);
      const done = list.filter((t) => statusOf(t.id) === 'concluido').length;
      const ratio = list.length === 0 ? 0 : done / list.length;
      bySection[section.id] = { done, total: list.length, ratio };

      if (section.roiWeight > 0) {
        weightedSum += section.roiWeight * ratio;
        weightTotal += section.roiWeight;
      }
    }

    return {
      concluded,
      studying,
      notStarted: TOPICS.length - concluded - studying,
      total: TOPICS.length,
      roiPercent: weightTotal === 0 ? 0 : Math.round((weightedSum / weightTotal) * 100),
      bySection,
    };
  }, [topics]);
}
