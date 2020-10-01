import { Prop, PropParsed, PropSchema } from './prop';
import { ObjectSchema } from '@becomes/purple-cheetah';

export interface PropGroupPointer {
  _id: string;
  items: Array<{
    props: Prop[];
  }>;
}

export interface PropGroupPointerParsed {
  [key: string]: PropParsed | PropParsed[];
}

export const PropGroupPointerSchema: ObjectSchema = {
  _id: {
    __type: 'string',
    __required: true,
  },
  items: {
    __type: 'array',
    __required: true,
    __child: {
      __type: 'object',
      __content: {
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
