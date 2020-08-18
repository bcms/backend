import { ObjectSchema } from '@becomes/purple-cheetah';

export interface PropEntryPointer {
  templateId: string;
  entryId: string;
  displayProp: string;
}

export const PropEntryPointerSchema: ObjectSchema = {
  templateId: {
    __type: 'string',
    __required: true,
  },
  entryId: {
    __type: 'string',
    __required: true,
  },
  displayProp: {
    __type: 'string',
    __required: true,
  },
};

export interface PropEntryPointerArray {
  templateId: string;
  entryIds: string[];
  displayProp: string;
}

export const PropEntryPointerArraySchema: ObjectSchema = {
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
