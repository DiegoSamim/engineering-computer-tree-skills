import {
  MASTERY_DIMENSIONS,
  type MasteryDimension,
  type ProgressEvent,
  type StoredEvent,
  type TopicStatus,
} from '../src/data/types.ts';

export type Validated<T> = { ok: true; value: T } | { ok: false; error: string };

const STATUSES: TopicStatus[] = ['nao-iniciado', 'em-estudo', 'concluido'];

function str(obj: Record<string, unknown>, key: string): string | null {
  const value = obj[key];
  return typeof value === 'string' && value.trim().length > 0 ? value : null;
}

/**
 * Validação estreita de ProgressEvent, escrita à mão para manter o servidor
 * sem dependências. Precisa ser rigorosa: esta é a fronteira que escreve no
 * banco, e o log é append-only — um evento malformado aceito aqui fica.
 */
export function validateEvent(input: unknown): Validated<ProgressEvent> {
  if (typeof input !== 'object' || input === null) return { ok: false, error: 'corpo deve ser um objeto' };
  const obj = input as Record<string, unknown>;

  const type = obj.type;
  if (typeof type !== 'string') return { ok: false, error: 'campo "type" ausente' };

  if (type === 'PROFILE_SET') {
    const displayName = str(obj, 'displayName');
    if (!displayName) return { ok: false, error: 'PROFILE_SET exige "displayName" não vazio' };
    return { ok: true, value: { type, displayName } };
  }

  const topicId = str(obj, 'topicId');
  if (!topicId) return { ok: false, error: `${type} exige "topicId"` };

  switch (type) {
    case 'TOPIC_STATUS_CHANGED': {
      const status = obj.status as TopicStatus;
      if (!STATUSES.includes(status)) {
        return { ok: false, error: `"status" deve ser um de: ${STATUSES.join(', ')}` };
      }
      return { ok: true, value: { type, topicId, status } };
    }

    case 'TOPIC_SECTION_COMPLETED':
    case 'TOPIC_SECTION_UNCOMPLETED': {
      const sectionKey = str(obj, 'sectionKey');
      if (!sectionKey) return { ok: false, error: `${type} exige "sectionKey"` };
      return { ok: true, value: { type, topicId, sectionKey } };
    }

    case 'MASTERY_TOGGLED': {
      const dimension = obj.dimension as MasteryDimension;
      if (!MASTERY_DIMENSIONS.includes(dimension)) {
        return { ok: false, error: `"dimension" deve ser uma de: ${MASTERY_DIMENSIONS.join(', ')}` };
      }
      if (typeof obj.value !== 'boolean') return { ok: false, error: '"value" deve ser booleano' };
      return { ok: true, value: { type, topicId, dimension, value: obj.value } };
    }

    case 'EXERCISE_MARKED': {
      const exerciseId = str(obj, 'exerciseId');
      if (!exerciseId) return { ok: false, error: 'EXERCISE_MARKED exige "exerciseId"' };
      if (typeof obj.done !== 'boolean') return { ok: false, error: '"done" deve ser booleano' };
      return { ok: true, value: { type, topicId, exerciseId, done: obj.done } };
    }

    case 'STUDY_SESSION_ENDED': {
      const seconds = obj.seconds;
      if (typeof seconds !== 'number' || !Number.isFinite(seconds)) {
        return { ok: false, error: '"seconds" deve ser um número finito' };
      }
      return { ok: true, value: { type, topicId, seconds } };
    }

    default:
      return { ok: false, error: `tipo de evento desconhecido: ${type}` };
  }
}

export function validateImport(input: unknown): Validated<{ schemaVersion: number; events: StoredEvent[] }> {
  if (typeof input !== 'object' || input === null) return { ok: false, error: 'corpo deve ser um objeto' };
  const obj = input as Record<string, unknown>;

  if (!Array.isArray(obj.events)) return { ok: false, error: 'campo "events" deve ser uma lista' };

  const events: StoredEvent[] = [];
  for (const [i, raw] of obj.events.entries()) {
    const result = validateEvent(raw);
    if (!result.ok) return { ok: false, error: `evento ${i}: ${result.error}` };

    const occurredAt = (raw as Record<string, unknown>).occurredAt;
    if (typeof occurredAt !== 'string' || Number.isNaN(Date.parse(occurredAt))) {
      return { ok: false, error: `evento ${i}: "occurredAt" deve ser uma data ISO` };
    }
    events.push({ ...result.value, occurredAt });
  }

  const schemaVersion = typeof obj.schemaVersion === 'number' ? obj.schemaVersion : 1;
  return { ok: true, value: { schemaVersion, events } };
}
