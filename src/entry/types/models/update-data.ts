import type { ObjectSchema } from '@becomes/purple-cheetah/types';
import { BCMSEntryMeta, BCMSEntryMetaFSDBSchema } from './main';

export interface BCMSEntryUpdateData {
  _id: string;
  templateId: string;
  status?: string;
  meta: BCMSEntryMeta[];
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
  status: {
    __type: 'string',
    __required: false,
  },
  meta: {
    __type: 'array',
    __required: true,
    __child: {
      __type: 'object',
      __content: BCMSEntryMetaFSDBSchema,
    },
  },
};
