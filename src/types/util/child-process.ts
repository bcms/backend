import type { Serializable, SpawnOptions } from 'child_process';

export interface BCMSChildProcess {
  spawn(
    cmd: string,
    args: string[],
    options?: SpawnOptions & {
      onChunk?(chunk: Serializable): void;
    },
  ): Promise<void>;
}
