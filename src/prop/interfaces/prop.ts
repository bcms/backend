import { PropEnum } from './enum';
import { PropGroupPointer, PropGroupPointerParsed } from './group-pointer';
import { PropEntryPointer } from './entry-pointer';
import { ObjectSchema } from '@becomes/purple-cheetah';
import { PropMedia } from './media';
import { PropQuill, PropWidgetParsed } from './quill';
import { PropWidget } from './quill';
import { EntryParsed } from '../../entry';

export enum PropType {
  STRING = 'STRING',
  NUMBER = 'NUMBER',
  BOOLEAN = 'BOOLEAN',

  DATE = 'DATE',
  ENUMERATION = 'ENUMERATION',
  MEDIA = 'MEDIA',

  GROUP_POINTER = 'GROUP_POINTER',
  ENTRY_POINTER = 'ENTRY_POINTER',

  HEADING_1 = 'HEADING_1',
  HEADING_2 = 'HEADING_2',
  HEADING_3 = 'HEADING_3',
  HEADING_4 = 'HEADING_4',
  HEADING_5 = 'HEADING_5',

  PARAGRAPH = 'PARAGRAPH',

  LIST = 'LIST',
  EMBED = 'EMBED',
  CODE = 'CODE',
  WIDGET = 'WIDGET',

  RICH_TEXT = 'RICH_TEXT',
}

export type PropValue =
  | string[]
  | boolean[]
  | number[]
  | PropEnum
  | PropGroupPointer
  | PropEntryPointer
  | PropMedia[]
  | PropQuill
  | PropWidget;

export interface Prop {
  type: PropType;
  required: boolean;
  name: string;
  label: string;
  array: boolean;
  value: PropValue;
}

export type PropParsed =
  | string
  | string[]
  | boolean
  | boolean[]
  | number
  | number[]
  | PropEnum
  | EntryParsed
  | EntryParsed[]
  | PropEntryPointer
  | PropGroupPointerParsed
  | PropGroupPointerParsed[]
  | PropWidgetParsed
  | {
      type: PropType;
      value: PropParsed;
    };

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
