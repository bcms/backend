import { EntryMeta } from '../models';
import { ObjectSchema } from '@becomes/purple-cheetah';

export interface UpdateEntryData {
  _id: string;
  title: string;
  slug: string;
  templateId: string;
  meta: EntryMeta[];
}

export const UpdateEntryDataSchema: ObjectSchema = {
  _id: {
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
  templateId: {
    __type: 'string',
    __required: true,
  },
  meta: {
    __type: 'array',
    __required: true,
    __child: {
      __type: 'object',
      __content: {
        lng: {
          __type: 'string',
          __required: true,
        },
        props: {
          __type: 'array',
          __required: true,
          __child: {
            __type: 'object',
            __content: {},
          },
        },
      },
    },
  },
};
