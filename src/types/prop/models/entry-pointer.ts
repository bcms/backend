import type { BCMSEntryContentParsedItem } from '@bcms/types';
import type { ObjectSchema } from '@becomes/purple-cheetah/types';
import type { BCMSPropParsed } from './main';

export interface BCMSPropEntryPointerData {
  templateId: string;
  entryIds: string[];
  displayProp: string;
}

// export interface BCMSPropEntryPointerDataParsed {
//   [lng: string]: BCMSPropParsed;
// }

export interface BCMSPropEntryPointerDataParsed {
  meta: BCMSPropParsed;
  content: BCMSEntryContentParsedItem[];
}

export const BCMSPropEntryPointerDataSchema: ObjectSchema = {
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
