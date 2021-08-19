import type { BCMSEvent } from '../types';

export function createBcmsEvent(fn: () => BCMSEvent): () => BCMSEvent {
  return fn;
}
