import type { ObjectSchema } from '@becomes/purple-cheetah/types';
import type { BCMSPropData, BCMSPropType } from './main';

export interface BCMSPropChange {
  add?: {
    label: string;
    type: BCMSPropType;
    required: boolean;
    array: boolean;
    defaultData?: BCMSPropData;
  };
  /** ID of the property which will be removed. */
  remove?: string;
  update?: {
    /** ID of the property which should be updated. */
    id: string;
    label: string;
    move: number;
    required: boolean;
    enumItems?: string[];
  };
}

export const BCMSPropChangeSchema: ObjectSchema = {
  add: {
    __type: 'object',
    __required: false,
    __child: {
      label: {
        __type: 'string',
        __required: true,
      },
      type: {
        __type: 'string',
        __required: true,
      },
      array: {
        __type: 'boolean',
        __required: true,
      },
      required: {
        __type: 'boolean',
        __required: true,
      },
    },
  },
  remove: {
    __type: 'string',
    __required: false,
  },
  update: {
    __type: 'object',
    __required: false,
    __child: {
      id: {
        __type: 'string',
        __required: true,
      },
      label: {
        __type: 'string',
        __required: true,
      },
      move: {
        __type: 'number',
        __required: true,
      },
      required: {
        __type: 'boolean',
        __required: true,
      },
      enumItems: {
        __type: 'array',
        __required: false,
        __child: {
          __type: 'string',
        },
      },
    },
  },
};
