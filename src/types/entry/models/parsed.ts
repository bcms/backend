import type { BCMSPropType } from '../../prop';

export interface BCMSEntryParsedMeta {
  [lng: string]: {
    [propName: string]: BCMSPropParsed;
  };
}

export interface BCMSEntryParsedContent {
  [lng: string]: Array<{
    type: BCMSPropType;
    value: BCMSPropParsed;
    name: string;
  }>;
}

export interface BCMSEntryParsed extends FSDBEntity {
  templateId: string;
  userId: string;
  status: string;
  meta: BCMSEntryParsedMeta;
  content: BCMSEntryParsedContent;
}
