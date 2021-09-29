import { BCMSConfig } from '@bcms/config';
import { Types } from 'mongoose';
import type { BCMSLanguage, BCMSLanguageFactory } from '../types';

export function createBcmsLanguageFactory(): BCMSLanguageFactory {
  return {
    create(data) {
      const lang: BCMSLanguage = {
        _id: new Types.ObjectId(),
        createdAt: Date.now(),
        updatedAt: Date.now(),
        code: data.code ? data.code : '',
        def: data.def ? data.def : false,
        name: data.name ? data.name : '',
        nativeName: data.nativeName ? data.nativeName : '',
        userId: data.userId ? data.userId : '',
      };
      if (BCMSConfig.database.fs) {
        lang._id = `${lang._id}` as never;
      }

      return lang;
    },
  };
}
