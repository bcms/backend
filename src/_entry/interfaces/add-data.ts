import {
  EntryContent,
  EntryContentSchema,
  EntryMeta,
  EntryMetaSchema,
} from '../models';
import { ObjectSchema } from '@becomes/purple-cheetah';

export interface AddEntryData {
  templateId: string;
  status?: string;
  meta: EntryMeta[];
  content: EntryContent[];
}

export const AddEntryDataSchema: ObjectSchema = {
  templateId: {
    __type: 'string',
    __required: true,
  },
  status: {
    __type: 'string',
    __required: false,
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
