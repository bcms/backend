import { Prop, PropSchema } from './prop';
import { ObjectSchema } from '@becomes/purple-cheetah';

export interface PropGroupPointer {
  _id: string;
  props: Prop[];
}

export const PropGroupPointerSchema: ObjectSchema = {
  _id: {
    __type: 'string',
    __required: true,
  },
  props: {
    __type: 'array',
    __required: true,
    __child: {
      __type: 'object',
      __content: PropSchema,
    },
  },
};

export interface PropGroupPointerArray {
  _id: string;
  array: Array<{
    uuid: string;
    props: Prop[];
  }>;
}

export const PropGroupPointerArraySchema: ObjectSchema = {
  _id: {
    __type: 'string',
    __required: true,
  },
  array: {
    __type: 'array',
    __required: true,
    __child: {
      __type: 'object',
      __content: {
        uuid: {
          __type: 'string',
          __required: true,
        },
        props: {
          __type: 'array',
          __required: true,
          __child: {
            __type: 'object',
            __content: PropSchema,
          },
        },
      },
    },
  },
};
