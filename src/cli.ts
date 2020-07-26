import { App } from './app';

export async function cli(args: string[]) {
  new App().listen();
}
