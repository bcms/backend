import type { ObjectSchema } from '@becomes/purple-cheetah/types';

export interface BCMSPropMetaValueEnum {
  items: string[];
  selected: string;
}

export const BCMSPropMetaValueEnumSchema: ObjectSchema = {
  items: {
    __type: 'array',
    __required: true,
    __child: {
      __type: 'string',
    },
  },
  selected: {
    __type: 'string',
    __required: true,
  },
};

export type BCMSPropContentValueEnum = string[];