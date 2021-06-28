import { PropType, PropValue } from './prop';
import { ObjectSchema } from '@becomes/purple-cheetah';

export interface PropChange {
  add?: {
    label: string;
    type: PropType;
    required: boolean;
    array: boolean;
    value?: PropValue;
  };
  remove?: string;
  update?: {
    label: {
      old: string;
      new: string;
    };
    move: number;
    required: boolean;
    enumItems?: string[];
  };
}

export const PropChangeSchema: ObjectSchema = {
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
      label: {
        __type: 'object',
        __required: true,
        __child: {
          old: {
            __type: 'string',
            __required: true,
          },
          new: {
            __type: 'string',
            __required: true,
          },
        },
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
