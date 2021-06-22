import type { ObjectSchema } from '@becomes/purple-cheetah/types';

export interface BCMSPropTemplateConfigEnum {
  items: string[];
  selected: string;
}

export const BCMSPropTemplateConfigEnumSchema: ObjectSchema = {
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

export type BCMSPropValueEnum = string;
