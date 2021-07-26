import * as childProcess from 'child_process';
import type { BCMSChildProcess } from '../types';

let bcmsChildProcess: BCMSChildProcess;

export function createBcmsChildProcess(): void {
  bcmsChildProcess = {
    async spawn(cmd, args, options) {
      return new Promise<void>((resolve, reject) => {
        const proc = childProcess.spawn(
          cmd,
          args,
          options ? options : { stdio: 'inherit' },
        );
        if (options && options.onChunk) {
          const onChunk = options.onChunk;
          proc.on('message', (chunk) => {
            onChunk(chunk);
          });
        }
        let error: Error | null = null;
        proc.on('error', (err) => {
          error = err;
        });
        proc.on('close', (code) => {
          if (code !== 0) {
            reject(error);
          } else {
            resolve();
          }
        });
      });
    },
  };
}

export function useBcmsChildProcess(): BCMSChildProcess {
  return bcmsChildProcess;
}
