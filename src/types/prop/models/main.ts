import type {
  BCMSPropColorPickerData,
  BCMSPropRichTextData,
  BCMSPropValueRichTextData,
} from '@bcms/types';
import type { BCMSEntryContentParsedItem } from '@bcms/types/entry';
import type { ObjectSchema } from '@becomes/purple-cheetah/types';
import type { BCMSPropDateData } from './date';
import type { BCMSPropEntryPointerData } from './entry-pointer';
import type { BCMSPropEnumData } from './enum';
import type {
  BCMSPropGroupPointerData,
  BCMSPropGroupPointerDataParsed,
  BCMSPropValueGroupPointerData,
} from './group-pointer';
import type { BCMSPropMediaData, BCMSPropMediaDataParsed } from './media';
import type {
  BCMSPropValueWidgetData,
  BCMSPropWidgetData,
  BCMSPropWidgetDataParsed,
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
  WIDGET = 'WIDGET',

  COLOR_PICKER = 'COLOR_PICKER',
  RICH_TEXT = 'RICH_TEXT',
  TAG = 'TAG',
}

export interface BCMSProp {
  id: string;
  type: BCMSPropType;
  required: boolean;
  name: string;
  label: string;
  array: boolean;
  defaultData: BCMSPropData;
}
export const BCMSPropSchema: ObjectSchema = {
  id: {
    __type: 'string',
    __required: true,
  },
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

export type BCMSPropData =
  | string[]
  | boolean[]
  | number[]
  | BCMSPropDateData
  | BCMSPropEnumData
  | BCMSPropEntryPointerData
  | BCMSPropGroupPointerData
  | BCMSPropMediaData[]
  | BCMSPropWidgetData
  | BCMSPropRichTextData[]
  | BCMSPropColorPickerData;
export interface BCMSPropParsed {
  [name: string]: BCMSPropDataParsed;
}

export type BCMSPropDataParsed =
  | string
  | string[]
  | boolean
  | boolean[]
  | number
  | number[]
  | BCMSPropEnumData
  | BCMSPropEntryPointerData
  | BCMSPropGroupPointerDataParsed
  | BCMSPropGroupPointerDataParsed[]
  | BCMSPropWidgetDataParsed
  | BCMSPropMediaDataParsed
  | BCMSPropMediaDataParsed[]
  | BCMSEntryContentParsedItem[]
  | BCMSEntryContentParsedItem[][]

export interface BCMSPropValue {
  /**
   * This property value is the same as in BCMSProp.
   * Using it, prop can be connected with metadata.
   */
  id: string;
  data: BCMSPropValueData;
}

export type BCMSPropValueData =
  | string[]
  | boolean[]
  | number[]
  | BCMSPropDateData
  | BCMSPropValueGroupPointerData
  | BCMSPropMediaData[]
  | BCMSPropValueWidgetData
  | BCMSPropValueRichTextData[];
