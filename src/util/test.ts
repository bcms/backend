import * as path from 'path';
import { BCMSTypeConverter } from './type-converter';
import type { Module } from '@becomes/purple-cheetah/types';
import { useFS } from '@becomes/purple-cheetah';
import { BCMSRepo } from '@bcms/repo';

export function createTest(): Module {
  return {
    name: 'Test',
    initialize({ next }) {
      start()
        .then(() => next())
        .catch((err) => next(err));
    },
  };
}

async function start() {
  const fs = useFS({
    base: path.join(process.cwd(), '_test'),
  });
  const template = await BCMSRepo.template.findById('61b06bc6b1e2aabb5b44ddc7');
  if (!template) {
    return;
  }
  const result = await BCMSTypeConverter.typescript([
    {
      name: template.name,
      type: 'entry',
      props: template.props,
    },
  ]);
  for (let i = 0; i < result.length; i++) {
    const item = result[i];
    await fs.save(item.outputFile, item.content);
  }
}

// start().catch((error) => {
//   // eslint-disable-next-line no-console
//   console.error(error);
//   process.exit(1);
// });
