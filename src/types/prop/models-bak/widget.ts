import type { ObjectSchema } from '@becomes/purple-cheetah/types';
import { BCMSProp, BCMSPropParsed, BCMSPropSchema } from './main';

export interface BCMSPropWidget {
  _id: string;
  props: BCMSProp[];
}

export interface BCMSPropWidgetParsed {
  [key: string]: BCMSPropParsed;
}

export const BCMSPropWidgetSchema: ObjectSchema = {
  _id: {
    __type: 'string',
    __required: true,
  },
  props: {
    __type: 'array',
    __required: true,
    __child: {
      __type: 'object',
      __content: BCMSPropSchema,
    },
  },
};
