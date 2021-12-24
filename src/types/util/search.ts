import type { BCMSEntryContentNode } from '..';

export interface BCMSSearch {
  searchText(data: { node: BCMSEntryContentNode }): string;
}
