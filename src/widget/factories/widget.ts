import { Types } from 'mongoose';
import { Widget, FSWidget } from '../models';

export class WidgetFactory {
  static instance(): Widget | FSWidget {
    if (process.env.DB_USE_FS === 'true') {
      return new FSWidget(
        new Types.ObjectId().toHexString(),
        Date.now(),
        Date.now(),
        '',
        '',
        '',
        '',
        '',
        '',
        [],
      );
    } else {
      return new Widget(
        new Types.ObjectId(),
        Date.now(),
        Date.now(),
        '',
        '',
        '',
        '',
        '',
        '',
        [],
      );
    }
  }
}
