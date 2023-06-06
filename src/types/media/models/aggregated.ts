import {
  FSDBEntity,
  FSDBEntitySchema,
} from '@becomes/purple-cheetah-mod-fsdb/types';
import type { BCMSMediaType } from './main';
import type { ObjectSchema } from '@becomes/purple-cheetah/types';

export interface BCMSMediaAggregate extends FSDBEntity {
  userId: string;
  type: BCMSMediaType;
  mimetype: string;
  size: number;
  name: string;
  path: string;
  isInRoot: boolean;
  children?: BCMSMediaAggregate[];
  state: boolean;
}

export const BCMSMediaAggregateSchema: ObjectSchema = {
  ...FSDBEntitySchema,
  userId: {
    __type: 'string',
    __required: true,
  },
  type: {
    __type: 'string',
    __required: true,
  },
  mimetype: {
    __type: 'string',
    __required: true,
  },
  size: {
    __type: 'number',
    __required: true,
  },
  name: {
    __type: 'string',
    __required: true,
  },
  path: {
    __type: 'string',
    __required: true,
  },
  isInRoot: {
    __type: 'boolean',
    __required: true,
  },
  state: {
    __type: 'boolean',
    __required: true,
  },
};
