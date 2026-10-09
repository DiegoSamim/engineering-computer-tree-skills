import type { ExportPayload, StoredEvent } from '../../src/domain/tree/api.ts';
import type { ProgressEventInput } from '../../src/domain/tree/types.ts';

export type Validated<T> = { ok: true; value: T } | { ok: false; error: string };

function str(obj: Record<string, unknown>, key: string): string | null {
  const value = obj[key];
  return typeof value === 'string' && value.trim().length > 0 ? value : null;
}

/**
 * Validação estreita e escrita à mão (o servidor não tem dependências). É a
 * fronteira que escreve no log append-only: o que passa daqui fica gravado.
 * Se o nó, o critério etc. existem é o store que confere, contra o catálogo.
 */
export function validateEvent(input: unknown): Validated<ProgressEventInput> {
  if (typeof input !== 'object' || input === null) return { ok: false, error: 'corpo deve ser um objeto' };
  const obj = input as Record<string, unknown>;

  const type = obj.type;
  if (typeof type !== 'string') return { ok: false, error: 'campo "type" ausente' };
  const node = str(obj, 'node');
  if (!node) return { ok: false, error: `${type} exige "node"` };

  switch (type) {
    case 'iniciou':
      return { ok: true, value: { type, node } };

    case 'criterio_marcado':
    case 'criterio_desmarcado': {
      const criterion = str(obj, 'criterion');
      if (!criterion) return { ok: false, error: `${type} exige "criterion"` };
      return { ok: true, value: { type, node, criterion } };
    }

    case 'guia_lida':
    case 'guia_desmarcada': {
      const guide = str(obj, 'guide');
      if (!guide) return { ok: false, error: `${type} exige "guide"` };
      return { ok: true, value: { type, node, guide } };
    }

    case 'exercicio_tentado':
    case 'exercicio_resolvido':
    case 'exercicio_desmarcado': {
      const exercise = str(obj, 'exercise');
      if (!exercise) return { ok: false, error: `${type} exige "exercise"` };
      return { ok: true, value: { type, node, exercise } };
    }

    case 'sessao_estudo': {
      const seconds = obj.seconds;
      if (typeof seconds !== 'number' || !Number.isInteger(seconds) || seconds <= 0) {
        return { ok: false, error: '"seconds" deve ser um inteiro positivo' };
      }
      return { ok: true, value: { type, node, seconds } };
    }

    default:
      return { ok: false, error: `tipo de evento desconhecido: ${type}` };
  }
}

export function validateImport(input: unknown): Validated<ExportPayload> {
  if (typeof input !== 'object' || input === null) return { ok: false, error: 'corpo deve ser um objeto' };
  const obj = input as Record<string, unknown>;
  if (obj.version !== 1) return { ok: false, error: 'campo "version" deve ser 1' };
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
  return { ok: true, value: { version: 1, events } };
}

export function validateProfile(input: unknown): Validated<{ displayName: string }> {
  if (typeof input !== 'object' || input === null) return { ok: false, error: 'corpo deve ser um objeto' };
  const displayName = str(input as Record<string, unknown>, 'displayName');
  if (!displayName || displayName.length > 80) return { ok: false, error: '"displayName" deve ter de 1 a 80 caracteres' };
  return { ok: true, value: { displayName: displayName.trim() } };
}
