import type { SpawnOptions } from 'child_process';

export interface BCMSChildProcess {
  spawn(
    cmd: string,
    args: string[],
    options?: SpawnOptions & {
      onChunk?(chunk: string): void;
    },
  ): Promise<void>;
}
