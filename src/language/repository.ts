import { createFSDBRepository } from '@becomes/purple-cheetah-mod-fsdb';
import { createMongoDBCachedRepository } from '@becomes/purple-cheetah-mod-mongodb';
import { useBcmsConfig } from '../config';
import {
  BCMSLanguageFSDB,
  BCMSLanguageFSDBSchema,
  BCMSLanguageMongoDB,
  BCMSLanguageMongoDBSchema,
  BCMSLanguageRepository,
  BCMSLanguageRepositoryMethods,
} from '../types';

let langRepo: BCMSLanguageRepository;

export function useBcmsLanguageRepository(): BCMSLanguageRepository {
  if (!langRepo) {
    const bcmsConfig = useBcmsConfig();
    const name = 'Language repository';
    const collection = `${bcmsConfig.database.prefix}_languages`;

    if (bcmsConfig.database.fs) {
      langRepo = createFSDBRepository<
        BCMSLanguageFSDB,
        BCMSLanguageRepositoryMethods<BCMSLanguageFSDB>
      >({
        name,
        collection,
        schema: BCMSLanguageFSDBSchema,
        methods({ repo }) {
          return {
            async findByCode(code) {
              return await repo.findBy((e) => e.code === code);
            },
            async findByDefault() {
              return await repo.findBy((e) => e.def === true);
            },
          };
        },
      });
    } else {
      langRepo = createMongoDBCachedRepository<
        BCMSLanguageMongoDB,
        BCMSLanguageRepositoryMethods<BCMSLanguageMongoDB>,
        undefined
      >({
        name,
        collection,
        schema: BCMSLanguageMongoDBSchema,
        methods({ mongoDBInterface, cacheHandler }) {
          return {
            async findByCode(code) {
              const cacheHit = cacheHandler.findOne((e) => e.code === code);
              if (cacheHit) {
                return cacheHit;
              }
              const lang = await mongoDBInterface.findOne({ code });
              if (lang) {
                cacheHandler.set(lang._id.toHexString(), lang);
              }
              return lang;
            },
            async findByDefault() {
              const cacheHit = cacheHandler.findOne((e) => e.def === true);
              if (cacheHit) {
                return cacheHit;
              }
              const lang = await mongoDBInterface.findOne({ def: true });
              if (lang) {
                cacheHandler.set(lang._id.toHexString(), lang);
              }
              return lang;
            },
          };
        },
      });
    }
  }
  return langRepo;
}
