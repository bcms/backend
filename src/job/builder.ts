import type { BCMSJob } from '../types';

export function createBcmsJob(fn: () => BCMSJob): () => BCMSJob {
  return fn;
}
