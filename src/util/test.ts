import * as path from 'path';
import { BCMSTypeConverter } from './type-converter';
import type { BCMSWidget } from '@bcms/types';
import type { Module } from '@becomes/purple-cheetah/types';
import { useFS } from '@becomes/purple-cheetah';
import { BCMSRepo } from '@bcms/repo';

const group1 = {
  _id: '1234',
  createdAt: 0,
  updatedAt: 0,
  cid: '1a',
  name: 'post_author',
  label: 'Post author',
  desc: 'This is some post group description.',
  props: [
    {
      id: '1',
      type: 'STRING',
      required: false,
      name: 'first_name',
      label: 'First name',
      array: false,
      defaultData: [''],
    },
    {
      id: '2',
      type: 'STRING',
      required: false,
      name: 'last_name',
      label: 'Last name',
      array: false,
      defaultData: [''],
    },
    {
      id: '2',
      type: 'MEDIA',
      required: false,
      name: 'photo',
      label: 'Photo',
      array: false,
      defaultData: [''],
    },
  ],
};

const widget1: BCMSWidget = {
  _id: '1234',
  createdAt: 0,
  updatedAt: 0,
  cid: '1a',
  name: 'author',
  label: 'Author',
  desc: 'This is some author widget description.',
  props: [
    {
      id: '1',
      type: 'RICH_TEXT',
      required: false,
      name: 'description',
      label: 'Description',
      array: false,
      defaultData: [],
    },
    {
      id: '2',
      type: 'GROUP_POINTER',
      required: false,
      name: 'Author',
      label: 'Author',
      array: false,
      defaultData: {
        _id: '61adce3ca7a076e52097cb2d',
      },
    },
    {
      id: '3',
      type: 'GROUP_POINTER',
      required: false,
      name: 'Author2',
      label: 'Author2',
      array: false,
      defaultData: {
        _id: '61adce3ca7a076e52097cb2d',
      },
    },
  ],
} as never;

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
const template = await BCMSRepo.template.findById('61a4c16ef0c20535d0231fdf')
if(!template){return ''}
  const result = await BCMSTypeConverter.typescript({
    target: template,
    type: 'template',
  });
  console.log(result);
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
