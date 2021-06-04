import type { ObjectSchema } from '@becomes/purple-cheetah/types';

export interface BCMSPropMetaValueEntryPointer {
  templateId: string;
  displayProp: string;
}

export const BCMSPropMetaValueEntryPointerSchema: ObjectSchema = {
  templateId: {
    __type: 'string',
    __required: true,
  },
  displayProp: {
    __type: 'string',
    __required: true,
  },
};

export type BCMSPropContentValueEntryPointer = string[];
