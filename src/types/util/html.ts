import type { BCMSEntryContentNode } from '..';

export interface BCMSHtml {
  nodeToHtml(data: { node: BCMSEntryContentNode }): string;
}
