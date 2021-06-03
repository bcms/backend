import type { FSDBEntity } from '@becomes/purple-cheetah/types';

export interface BCMSGroupLite extends FSDBEntity {
  name: string;
  label: string;
  desc: string;
  propsCount: number;
}
