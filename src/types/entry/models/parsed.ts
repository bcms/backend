import type { FSDBEntity } from '@becomes/purple-cheetah-mod-fsdb/types';
import type { BCMSPropParsed } from '../../prop';

export interface BCMSEntryParsedMeta {
  [lng: string]: BCMSPropParsed;
}

// export interface EntryParsedContent {
//   [lng: string]: Array<{
//     type: PropType;
//     value: PropParsed;
//     name: string;
//   }>;
// }

export interface BCMSEntryParsed extends FSDBEntity {
  templateId: string;
  userId: string;
  status: string;
  meta: BCMSEntryParsedMeta;
  // content: BCMSEntryParsedContent;
}
