import type {
  BCMSEntryContentNode,
  BCMSEntryContentParsedItem,
} from '@bcms/types';

export interface BCMSPropRichTextData {
  nodes: BCMSEntryContentNode[];
}

export interface BCMSPropValueRichTextData {
  nodes: BCMSEntryContentNode[];
}

export type BCMSPropRichTextDataParsed =
  | BCMSEntryContentParsedItem[]
  | BCMSEntryContentParsedItem[][];
