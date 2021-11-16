import type { BCMSTag } from './models';

export interface BCMSTagFactory {
  create(data: { value: string }): BCMSTag;
}
