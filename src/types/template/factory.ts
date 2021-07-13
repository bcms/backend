import type { BCMSProp } from '../prop';
import type { BCMSTemplate } from './models';

export interface BCMSTemplateFactory {
  create(data: {
    cid?: string;
    name?: string;
    label?: string;
    desc?: string;
    userId?: string;
    singleEntry?: boolean;
    props?: BCMSProp[];
  }): BCMSTemplate;
}
