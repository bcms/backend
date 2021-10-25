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
    const customPackageJson = JSON.parse(
      (await fs.read('custom-package.json')).toString(),
    );
    const packageJson = JSON.parse((await fs.read('package.json')).toString());
    for (const depName in customPackageJson.dependencies) {
      packageJson.dependencies[depName] =
        customPackageJson.dependencies[depName];
    }
    await fs.save('package.json', JSON.stringify(packageJson, null, '  '));
    await BCMSChildProcess.spawn('npm', ['i']);
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
