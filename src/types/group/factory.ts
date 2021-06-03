import type { BCMSGroup, BCMSGroupLite } from './models';

export interface BCMSGroupFactory {
  create(): BCMSGroup;
  toLite(group: BCMSGroup): BCMSGroupLite;
}
