import type { BCMSProp } from '../../types';
import type { BCMSWidget } from './models';

export interface BCMSWidgetFactory {
  create(data: {
    name?: string;
    label?: string;
    desc?: string;
    previewImage?: string;
    previewScript?: string;
    previewStyle?: string;
    props?: BCMSProp[];
  }): BCMSWidget;
}
