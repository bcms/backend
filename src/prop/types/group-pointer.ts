import type { ObjectSchema } from '@becomes/purple-cheetah/types';
import { BCMSProp, BCMSPropParsed, BCMSPropSchema } from './main';

export interface BCMSPropGroupPointer {
  _id: string;
  items: Array<{
    props: BCMSProp[];
  }>;
}

export interface BCMSPropGroupPointerParsed {
  [key: string]: BCMSPropParsed | BCMSPropParsed[];
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
            __content: BCMSPropSchema,
          },
        },
      },
    },
  },
};
