import * as path from 'path';
import { useFS } from '@becomes/purple-cheetah';
import { BCMSRepo } from './repo';
import { BCMSTypeConverter } from './util';

export async function jsdoctest(): Promise<void> {
  const template = await BCMSRepo.template.findById('61b06bc6b1e2aabb5b44ddc7');
  if (!template) {
    return;
  }
  const result = await BCMSTypeConverter.jsDoc([
    {
      name: 'Blog',
      type: 'entry',
      props: template.props,
    },
  ]);
  const fs = useFS({
    base: path.join(process.cwd(), '_test'),
  });
  console.log(result);
  for (let i = 0; i < result.length; i++) {
    const item = result[i];
    fs.save(item.outputFile, item.content);
  }
}
