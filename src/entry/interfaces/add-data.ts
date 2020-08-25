import { EntryMeta, EntryMetaSchema } from '../models';
import { ObjectSchema } from '@becomes/purple-cheetah';

export interface AddEntryData {
  templateId: string;
  meta: EntryMeta[];
}

export const AddEntryDataSchema: ObjectSchema = {
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
};
