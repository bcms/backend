#!/usr/bin/env node

import { Config } from '../config';
import { App } from '../app';
import { PurpleCheetah } from '@becomes/purple-cheetah';

interface Args {
  dev: boolean;
}

function parseArgs(rawArgs: string[]): Args {
  const args = {};
  let i = 2;
  while (i < rawArgs.length) {
    const a = rawArgs[i];
    let value = '';
    if (rawArgs[i + 1]) {
      value = rawArgs[i + 1].startsWith('--') ? '' : rawArgs[i + 1];
    }
    args[a] = value;
    if (value === '') {
      i = i + 1;
    } else {
      i = i + 2;
    }
  }
  return {
    dev: args['--dev'] === '' || args['--dev'] === 'true' || false,
  };
}
const arg = parseArgs(process.argv);
let app: PurpleCheetah;

if (arg.dev) {
  process.env.DEV = 'true';
}

Config.init()
  .then(() => {
    app = new App();
    app.listen();
  })
  .catch((error) => {
    // tslint:disable-next-line: no-console
    console.error(error);
    process.exit(1);
  });

export const Application = app;
