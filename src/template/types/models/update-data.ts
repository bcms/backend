import type { ObjectSchema } from '@becomes/purple-cheetah/types';
import { BCMSPropChange, BCMSPropChangeSchema } from '../../../types';

export interface BCMSTemplateUpdateData {
  _id: string;
  label?: string;
  desc?: string;
  singleEntry?: boolean;
  propChanges?: BCMSPropChange[];
}

export const BCMSTemplateUpdateDataSchema: ObjectSchema = {
  _id: {
    __type: 'string',
    __required: true,
  },
  label: {
    __type: 'string',
    __required: false,
  },
  desc: {
    __type: 'string',
    __required: false,
  },
  singleEntry: {
    __type: 'boolean',
    __required: false,
  },
  propChanges: {
    __type: 'array',
    __required: false,
    __child: {
      __type: 'object',
      __content: BCMSPropChangeSchema,
    },
  },
};
