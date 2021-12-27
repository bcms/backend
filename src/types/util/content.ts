import type { BCMSEntryContentNode } from '../entry';

export interface BCMSContentUtility {
  nodeToHtml(data: { node: BCMSEntryContentNode }): string;
  nodeToText(data: { node: BCMSEntryContentNode }): string;
}
