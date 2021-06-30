import type { FSDBEntity } from '@becomes/purple-cheetah-mod-fsdb/types';
import type { ObjectSchema } from '@becomes/purple-cheetah/types';
import { BCMSEntryMeta, BCMSEntryMetaFSDBSchema } from './main';

export interface BCMSEntryLite extends FSDBEntity {
  templateId: string;
  userId: string;
  meta: BCMSEntryMeta[];
}

export const BCMSEntryLiteSchema: ObjectSchema = {
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
  userId: {
    __type: 'string',
    __required: true,
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
