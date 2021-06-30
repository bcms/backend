import type { BCMSEntry, BCMSEntryLite, BCMSEntryMeta } from './models';

export interface BCMSEntryFactory {
  create(data: {
    templateId?: string;
    userId?: string;
    status?: string;
    meta?: BCMSEntryMeta[];
  }): BCMSEntry;
  toLite(entry: BCMSEntry): BCMSEntryLite;
}
