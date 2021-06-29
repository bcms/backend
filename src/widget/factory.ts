import { Types } from 'mongoose';
import { useBcmsConfig } from '../config';
import type { BCMSWidget, BCMSWidgetFactory } from './types';

let widgetFactory: BCMSWidgetFactory;

export function useBcmsWidgetFactory(): BCMSWidgetFactory {
  if (!widgetFactory) {
    const bcmsConfig = useBcmsConfig();
    widgetFactory = {
      create(data) {
        const widget: BCMSWidget = {
          _id: new Types.ObjectId(),
          createdAt: Date.now(),
          updatedAt: Date.now(),
          desc: data.desc ? data.desc : '',
          label: data.label ? data.label : '',
          name: data.name ? data.name : '',
          previewImage: data.previewImage ? data.previewImage : '',
          previewScript: data.previewScript ? data.previewScript : '',
          previewStyle: data.previewStyle ? data.previewStyle : '',
          props: [],
        };
        if (bcmsConfig.database.fs) {
          widget._id = widget._id.toHexString() as never;
        }
        return widget;
      },
    };
  }

  return widgetFactory;
}
