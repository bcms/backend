import type { ObjectSchema } from '@becomes/purple-cheetah/types';
import type { BCMSPropEnum } from './enum';
import type { BCMSPropEntryPointer } from './entry-pointer';
import type { BCMSPropMedia } from './media';
import type { BCMSPropWidget, BCMSPropWidgetParsed } from './widget';
import type {
  BCMSPropGroupPointer,
  PropGroupPointerParsed,
} from './group-pointer';
import type { BCMSEntryParsed } from '../../entry';

// eslint-disable-next-line no-shadow
export enum BCMSPropType {
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

export type BCMSPropValue =
  | string[]
  | boolean[]
  | number[]
  | BCMSPropEnum
  | BCMSPropGroupPointer
  | BCMSPropEntryPointer
  | BCMSPropMedia[]
  | BCMSPropWidget;

export interface BCMSProp {
  type: BCMSPropType;
  required: boolean;
  name: string;
  label: string;
  array: boolean;
  value: BCMSPropValue;
}

export type BCMSPropParsed =
  | string
  | string[]
  | boolean
  | boolean[]
  | number
  | number[]
  | BCMSPropEnum
  | BCMSEntryParsed
  | BCMSEntryParsed[]
  | BCMSPropEntryPointer
  | PropGroupPointerParsed
  | PropGroupPointerParsed[]
  | BCMSPropWidgetParsed
  | {
      type: BCMSPropType;
      value: BCMSPropParsed;
    };

export const BCMSPropSchema: ObjectSchema = {
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
