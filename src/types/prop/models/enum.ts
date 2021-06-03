import type { ObjectSchema } from '@becomes/purple-cheetah/types';

export interface BCMSPropEnum {
  items: string[];
  selected?: string;
}

export const BCMSPropEnumSchema: ObjectSchema = {
  items: {
    __type: 'array',
    __required: true,
    __child: {
      __type: 'string',
    },
  },
  selected: {
    __type: 'string',
    __required: false,
  },
};
