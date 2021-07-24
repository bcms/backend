import type { BCMSEntryContent } from '../entry';

export interface BCMSEntryContentUtility {
  check(data: { content: BCMSEntryContent }): Promise<Error | void>;
}
