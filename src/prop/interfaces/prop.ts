import { PropEnum } from './enum';
import { PropGroupPointer } from './group-pointer';
import { PropEntryPointer } from './entry-pointer';
import { ObjectSchema } from '@becomes/purple-cheetah';
import { PropMedia } from './media';

export enum PropType {
  STRING = 'STRING',
  NUMBER = 'NUMBER',
  BOOLEAN = 'BOOLEAN',

  DATE = 'DATE',
  ENUMERATION = 'ENUMERATION',
  MEDIA = 'MEDIA',

  GROUP_POINTER = 'GROUP_POINTER',
  ENTRY_POINTER = 'ENTRY_POINTER',
}

export interface Prop {
  type: PropType;
  required: boolean;
  name: string;
  label: string;
  array: boolean;
  value:
    | string[]
    | boolean[]
    | number[]
    | PropEnum
    | PropGroupPointer
    | PropEntryPointer
    | PropMedia[];
}

export const PropSchema: ObjectSchema = {
  type: {
    __type: 'string',
    __required: true,
  },
  required: {
    __type: 'boolean',
    __required: true,
  },
  name: {
    __type: 'string',
    __required: true,
  },
  label: {
    __type: 'string',
    __required: true,
  },
  array: {
    __type: 'boolean',
    __required: true,
  },
};
