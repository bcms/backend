import type { BCMSGroup, BCMSGroupLite } from './models';

export interface BCMSGroupFactory {
  create(config: { label: string; name: string; desc: string }): BCMSGroup;
  toLite(group: BCMSGroup): BCMSGroupLite;
}
