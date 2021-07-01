import type { BCMSEntry, BCMSEntryParsed } from './models';

export interface BCMSEntryParser {
  parse(data: {
    entry: BCMSEntry;
    justLng?: string;
    level?: string;
    depth?: number;
    maxDepth: number;
  }): Promise<BCMSEntryParsed | null>;
}
