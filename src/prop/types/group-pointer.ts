import type { ObjectSchema } from '@becomes/purple-cheetah/types';

export interface BCMSPropGroupPointer {
  _id: string;
  items: Array<{
    props: Prop[];
  }>;
}

export interface BCMSPropGroupPointerParsed {
  [key: string]: PropParsed | PropParsed[];
}

export const BCMSPropGroupPointerSchema: ObjectSchema = {
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
