import { Prop, PropSchema, PropType } from './prop';
import { ObjectSchema } from '@becomes/purple-cheetah';

export interface PropChange {
  add?: {
    label: string;
    type: PropType;
    required: boolean;
    array: boolean;
    value?: any;
  };
  remove?: string;
  update?: {
    label: {
      old: string;
      new: string;
    };
    required: boolean;
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
      required: {
        __type: 'boolean',
        __required: true,
      },
    },
  },
};
