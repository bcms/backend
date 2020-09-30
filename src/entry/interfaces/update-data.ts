import {
  EntryContent,
  EntryContentSchema,
  EntryMeta,
  EntryMetaSchema,
} from '../models';
import { ObjectSchema } from '@becomes/purple-cheetah';

export interface UpdateEntryData {
  _id: string;
  templateId: string;
  meta: EntryMeta[];
  content: EntryContent[];
}

export const UpdateEntryDataSchema: ObjectSchema = {
  _id: {
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
      __content: EntryMetaSchema,
    },
  },
  content: {
    __type: 'array',
    __required: true,
    __child: {
      __type: 'object',
      __content: EntryContentSchema,
    },
  },
};
