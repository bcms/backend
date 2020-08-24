import { ObjectSchema } from '@becomes/purple-cheetah';

export interface PropEntryPointer {
  templateId: string;
  entryIds: string[];
  displayProp: string;
}

export const PropEntryPointerSchema: ObjectSchema = {
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
