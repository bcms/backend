import { BCMSConfig } from '@bcms/config';
import { BCMSRepo } from '@bcms/repo';
import { createFSDBRepository } from '@becomes/purple-cheetah-mod-fsdb';
import { createMongoDBCachedRepository } from '@becomes/purple-cheetah-mod-mongodb';
import type { Module } from '@becomes/purple-cheetah/types';
import {
  BCMSLanguageFSDB,
  BCMSLanguageFSDBSchema,
  BCMSLanguageMongoDB,
  BCMSLanguageMongoDBSchema,
  BCMSLanguageRepositoryMethods,
} from '../types';

export function createBcmsLanguageRepository(): Module {
  return {
    name: 'Create language repository',
    initialize({ next }) {
      const name = 'Language repository';
      const collection = `${BCMSConfig.database.prefix}_languages`;

      BCMSRepo.language = BCMSConfig.database.fs
        ? createFSDBRepository<
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
          })
        : createMongoDBCachedRepository<
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
                    cacheHandler.set(`${lang._id}`, lang);
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
                    cacheHandler.set(`${lang._id}`, lang);
                  }
                  return lang;
                },
              };
            },
          });

      next();
    },
  };
}
