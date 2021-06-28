import { Types } from 'mongoose';
import { useBcmsConfig } from '../config';
import type { BCMSLanguage, BCMSLanguageFactory } from './types';

let langFactory: BCMSLanguageFactory;

export function useBcmsLanguageFactory(): BCMSLanguageFactory {
  if (!langFactory) {
    const bcmsConfig = useBcmsConfig();
    langFactory = {
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
        if (bcmsConfig.database.fs) {
          lang._id = lang._id.toHexString() as never;
        }

        return lang;
      },
    };
  }

  return langFactory;
}
