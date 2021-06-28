import type { ObjectSchema } from '@becomes/purple-cheetah/types';

export interface BCMSPropEntryPointer {
  templateId: string;
  entryIds: string[];
  displayProp: string;
}

export const BCMSPropEntryPointerSchema: ObjectSchema = {
  templateId: {
    __type: 'string',
    __required: true,
  },
  entryIds: {
    __type: 'array',
    __required: true,
    __child: {
      __type: 'string',
    },
  },
  displayProp: {
    __type: 'string',
    __required: true,
  },
};
