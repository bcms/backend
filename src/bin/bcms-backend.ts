#!/usr/bin/env node

import { Config } from '../config';
import { App } from '../app';

Config.init()
  .then(() => {
    new App().listen();
  })
  .catch((error) => {
    // tslint:disable-next-line: no-console
    console.error(error);
    process.exit(1);
  });
