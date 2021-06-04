import type { BCMSPropContentValueEnum, BCMSPropMetaValueEnum } from './enum';
import type {
  BCMSPropContentValueEntryPointer,
  BCMSPropMetaValueEntryPointer,
} from './entry-pointer';
import type {
  BCMSPropContentValueMedia,
  BCMSPropMetaValueMedia,
} from './media';
import type {
  BCMSPropContentValueGroupPointer,
  BCMSPropMetaValueGroupPointer,
} from './group-pointer';
import type {
  BCMSPropContentValueWidget,
  BCMSPropMetaValueWidget,
} from './widget';

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

export type BCMSPropMetaValue =
  | string[]
  | number[]
  | boolean[]
  | BCMSPropMetaValueEntryPointer
  | BCMSPropMetaValueEnum
  | BCMSPropMetaValueGroupPointer
  | BCMSPropMetaValueMedia[]
  | BCMSPropMetaValueWidget;

export interface BCMSPropMeta {
  id: string;
  type: BCMSPropType;
  name: string;
  label: string;
  array: boolean;
  value: BCMSPropMetaValue;
}

export type BCMSPropContentValue =
  | string[]
  | number[]
  | boolean[]
  | BCMSPropContentValueEntryPointer
  | BCMSPropContentValueEnum
  | BCMSPropContentValueGroupPointer
  | BCMSPropContentValueMedia[]
  | BCMSPropContentValueWidget;

export interface BCMSPropContent {
  id: string;
  value: BCMSPropContentValue;
}
