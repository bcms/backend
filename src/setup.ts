import { useFS } from '@becomes/purple-cheetah';
import type { Module } from '@becomes/purple-cheetah/types';
import { loadBcmsConfig } from './config';
import { loadBcmsResponseCodes } from './response-code';
import { BCMSChildProcess } from './util';

async function init() {
  await loadBcmsConfig();
  await loadBcmsResponseCodes();
  const fs = useFS({
    base: process.cwd(),
  });
  if (await fs.exist('custom-package.json', true)) {
    const json = JSON.parse((await fs.read('custom-package.json')).toString());
    delete json.devDependencies;
    await fs.save(
      'custom-packages/package.json',
      JSON.stringify(json, null, '  '),
    );
    await BCMSChildProcess.spawn('npm', ['--prefix', 'custom-packages', 'i']);
  }
}

export function bcmsSetup(): Module {
  return {
    name: 'Setup',
    initialize({ next }) {
      init()
        .then(() => next())
        .catch((err) => next(err));
    },
  };
}
