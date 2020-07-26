#!/usr/bin/env node

// tslint:disable-next-line: no-var-requires
require = require('esm')(module /*, options */);
// tslint:disable-next-line: no-var-requires
require('../cli.js').cli(process.argv);
