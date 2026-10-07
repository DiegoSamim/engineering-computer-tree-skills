import { SECTIONS, TOPICS } from '../src/content/roadmap.ts';
import { transaction, bit, type Db } from './db.ts';

/**
 * Espelha o catálogo (que continua versionado no git, em TypeScript) para
 * dentro do banco. As tabelas existem para integridade referencial e para
 * permitir consultas — não são a fonte da verdade do conteúdo.
 *
 * Idempotente: roda a cada boot e converge. Editar `src/content/roadmap.ts` e
 * reiniciar é suficiente para o banco acompanhar.
 */
export function seedCatalog(db: Db): { sections: number; topics: number } {
  const upsertSection = db.prepare(`
    INSERT INTO section (id, level, title, kind, position, roi_weight)
    VALUES (?, ?, ?, ?, ?, ?)
    ON CONFLICT(id) DO UPDATE SET
      level = excluded.level, title = excluded.title, kind = excluded.kind,
      position = excluded.position, roi_weight = excluded.roi_weight
  `);

  const upsertTopic = db.prepare(`
    INSERT INTO topic (id, section_id, name, priority, position, has_content)
    VALUES (?, ?, ?, ?, ?, ?)
    ON CONFLICT(id) DO UPDATE SET
      section_id = excluded.section_id, name = excluded.name,
      priority = excluded.priority, position = excluded.position,
      has_content = excluded.has_content
  `);

  return transaction(db, () => {
    SECTIONS.forEach((section, index) => {
      upsertSection.run(
        section.id,
        section.level ?? null,
        section.title,
        section.kind,
        index,
        section.roiWeight,
      );
    });

    TOPICS.forEach((topic, index) => {
      upsertTopic.run(topic.id, topic.sectionId, topic.name, topic.priority, index, bit(Boolean(topic.route)));
    });

    return { sections: SECTIONS.length, topics: TOPICS.length };
  });
}
