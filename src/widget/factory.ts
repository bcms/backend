import { BCMSConfig } from '@bcms/config';
import { Types } from 'mongoose';
import type { BCMSWidget, BCMSWidgetFactory } from '../types';

export function createBcmsWidgetFactory(): BCMSWidgetFactory {
  return {
    create(data) {
      const widget: BCMSWidget = {
        _id: new Types.ObjectId(),
        createdAt: Date.now(),
        updatedAt: Date.now(),
        cid: data.cid ? data.cid : '',
        desc: data.desc ? data.desc : '',
        label: data.label ? data.label : '',
        name: data.name ? data.name : '',
        previewImage: data.previewImage ? data.previewImage : '',
        previewScript: data.previewScript ? data.previewScript : '',
        previewStyle: data.previewStyle ? data.previewStyle : '',
        props: [],
      };
      if (BCMSConfig.database.fs) {
        widget._id = `${widget._id}` as never;
      }
      return widget;
    },
  };
}
