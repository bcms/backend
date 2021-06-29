import { createFSDBRepository } from '@becomes/purple-cheetah-mod-fsdb';
import { createMongoDBCachedRepository } from '@becomes/purple-cheetah-mod-mongodb';
import { useBcmsConfig } from '../config';
import {
  BCMSTemplateFSDB,
  BCMSTemplateFSDBSchema,
  BCMSTemplateMongoDB,
  BCMSTemplateMongoDBSchema,
  BCMSTemplateRepository,
  BCMSTemplateRepositoryMethods,
} from './types';

let tempRepo: BCMSTemplateRepository;

export function useBcmsTemplateRepository(): BCMSTemplateRepository {
  if (!tempRepo) {
    const bcmsConfig = useBcmsConfig();
    const nm = 'Template repository';
    const collection = `${bcmsConfig.database.prefix}_templates`;

    if (bcmsConfig.database.fs) {
      tempRepo = createFSDBRepository<
        BCMSTemplateFSDB,
        BCMSTemplateRepositoryMethods<BCMSTemplateFSDB>
      >({
        name: nm,
        collection,
        schema: BCMSTemplateFSDBSchema,
        methods({ repo }) {
          return {
            async findByName(name) {
              return await repo.findBy((e) => e.name === name);
            },
          };
        },
      });
    } else {
      tempRepo = createMongoDBCachedRepository<
        BCMSTemplateMongoDB,
        BCMSTemplateRepositoryMethods<BCMSTemplateMongoDB>,
        unknown
      >({
        name: nm,
        collection,
        schema: BCMSTemplateMongoDBSchema,
        methods({ mongoDBInterface, cacheHandler }) {
          return {
            async findByName(name) {
              const cacheHit = cacheHandler.findOne((e) => e.name === name);
              if (cacheHit) {
                return cacheHit;
              }
              const temp = await mongoDBInterface.findOne({ name });
              if (temp) {
                cacheHandler.set(temp._id.toHexString(), temp);
              }
              return temp;
            },
          };
        },
      });
    }
  }

  return tempRepo;
}
