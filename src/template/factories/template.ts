import { Template, FSTemplate } from '../models';
import { Types } from 'mongoose';

export class TemplateFactory {
  public static get instance(): Template | FSTemplate {
    if (process.env.DB_USE_FS === 'true') {
      return new FSTemplate(
        new Types.ObjectId().toHexString(),
        Date.now(),
        Date.now(),
        '',
        '',
        '',
        '',
        false,
        [],
      );
    } else {
      return new Template(
        new Types.ObjectId(),
        Date.now(),
        Date.now(),
        '',
        '',
        '',
        '',
        false,
        [],
      );
    }
  }
}
