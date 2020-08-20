import { Language, FSLanguage } from '../models';
import { Types } from 'mongoose';

export class LanguageFactory {
  static get instance(): Language | FSLanguage {
    if (process.env.DB_USE_FS === 'true') {
      return new FSLanguage(
        new Types.ObjectId().toHexString(),
        Date.now(),
        Date.now(),
        '',
        '',
        '',
        '',
        false,
      );
    } else {
      return new Language(
        new Types.ObjectId(),
        Date.now(),
        Date.now(),
        '',
        '',
        '',
        '',
        false,
      );
    }
  }
}
