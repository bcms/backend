import { Prop, PropSchema } from './prop';
import { ObjectSchema } from '@becomes/purple-cheetah';

export interface PropChange {
  add?: Prop;
  remove?: string;
  update?: {
    name: {
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
    __child: PropSchema,
  },
  remove: {
    __type: 'string',
    __required: false,
  },
  update: {
    __type: 'object',
    __required: false,
    __child: {
      name: {
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
