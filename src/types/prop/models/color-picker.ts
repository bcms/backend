import { BCMSColorFSDBSchema } from '@bcms/types';
import type { ObjectSchema } from '@becomes/purple-cheetah/types';
import type { BCMSPropDataParsed } from './main';

export interface BCMSPropColorPickerData {
  allowCustom: boolean;
  options: string[];
  selected: string[];
}

export interface BCMSPropColorPickerDataParsed {
  [key: string]: BCMSPropDataParsed;
}

export const BCMSPropColorPickerDataSchema: ObjectSchema = {
  allowCustom: {
    __type: 'string',
    __required: true,
  },
  option: {
    __type: 'array',
    __required: true,
    __child: {
      __type: 'string',
      __content: BCMSColorFSDBSchema,
    },
  },
  selected: {
    __type: 'array',
    __required: true,
    __child: {
      __type: 'string',
    },
  },
};

export type BCMSPropValueColorPickerData = string[];
