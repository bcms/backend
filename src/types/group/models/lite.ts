import {
  FSDBEntity,
  FSDBEntitySchema,
} from '@becomes/purple-cheetah-mod-fsdb/types';
import type { ObjectSchema } from '@becomes/purple-cheetah/types';

export interface BCMSGroupLite extends FSDBEntity {
  cid: string;
  name: string;
  label: string;
  desc: string;
  propsCount: number;
}

export const BCMSGroupLiteSchema: ObjectSchema = {
  ...FSDBEntitySchema,
  cid: {
    __type: 'string',
    __required: true,
  },
  name: {
    __type: 'string',
    __required: true,
  },
  label: {
    __type: 'string',
    __required: true,
  },
  desc: {
    __type: 'string',
    __required: true,
  },
  propsCount: {
    __type: 'number',
    __required: true,
  },
};
