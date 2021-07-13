import type { BCMSGroup, BCMSGroupLite } from './models';

export interface BCMSGroupFactory {
  create(config: {
    cid: string;
    label: string;
    name: string;
    desc: string;
  }): BCMSGroup;
  toLite(group: BCMSGroup): BCMSGroupLite;
}
