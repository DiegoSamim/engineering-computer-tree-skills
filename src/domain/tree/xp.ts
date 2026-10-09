import type { EventType } from './types.ts';

/**
 * XP de um evento. Vai para a área-casa do nó, nunca duplicado por espelho.
 * Desmarcar devolve o XP de marcar, para o saldo refletir o estado real.
 */
export function xpFor(type: EventType): number {
  switch (type) {
    case 'criterio_marcado':
      return 10;
    case 'criterio_desmarcado':
      return -10;
    default:
      return 0;
  }
}
