import type { BCMSColor, BCMSColorSource } from './models';

export interface BCMSColorFactory {
  create(data: {
    cid?: string;
    label?: string;
    name?: string;
    value?: string;
    userId?: string;
    source?: BCMSColorSource;
  }): BCMSColor;
}
