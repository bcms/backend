import type { BCMSProp } from '../../types';
import type { BCMSTemplate } from './models';

export interface BCMSTemplateFactory {
  create(data: {
    name?: string;
    label?: string;
    desc?: string;
    userId?: string;
    singleEntry?: boolean;
    props?: BCMSProp[];
  }): BCMSTemplate;
}