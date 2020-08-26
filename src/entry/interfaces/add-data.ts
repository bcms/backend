import { EntryMeta } from '../models';
import { ObjectSchema } from '@becomes/purple-cheetah';

export interface AddEntryData {
  title: string;
  slug: string;
  templateId: string;
  meta: EntryMeta[];
}

export const AddEntryDataSchema: ObjectSchema = {
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
