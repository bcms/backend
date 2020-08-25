import { ObjectSchema } from '@becomes/purple-cheetah';
import { EntryMetaSchema, EntryMeta } from '../models';

export interface EntryLite {
  _id: string;
  createdAt: number;
  updatedAt: number;
  title: string;
  slug: string;
  templateId: string;
  userId: string;
  meta: EntryMeta[];
}

export const EntryLiteSchema: ObjectSchema = {
  _id: {
    __type: 'string',
    __required: true,
  },
  createdAt: {
    __type: 'number',
    __required: true,
  },
  updatedAt: {
    __type: 'number',
    __required: true,
  },
  templateId: {
    __type: 'string',
    __required: true,
  },
  title: {
    __type: 'string',
    __required: true,
  },
  slug: {
    __type: 'string',
    __required: true,
  },
  userId: {
    __type: 'string',
    __required: true,
  },
  meta: {
    __type: 'array',
    __required: true,
    __child: {
      __type: 'object',
      __content: EntryMetaSchema,
    },
  },
};
