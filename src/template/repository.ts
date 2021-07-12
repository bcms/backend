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
            async findByCid(cid) {
              return await repo.findBy((e) => e.cid === cid);
            },
            async findAllByCid(cids) {
              return await repo.findAllBy((e) => cids.includes(e.cid));
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
            async findByCid(cid) {
              const cacheHit = cacheHandler.findOne((e) => e.cid === cid);
              if (cacheHit) {
                return cacheHit;
              }
              const item = await mongoDBInterface.findOne({ cid });
              if (item) {
                cacheHandler.set(item._id.toHexString(), item);
              }
              return item;
            },
            async findAllByCid(cids) {
              const cacheHits = cacheHandler.find((e) => cids.includes(e.cid));
              if (cacheHits.length === cids.length) {
                return cacheHits;
              }
              const missingCids: string[] = [];
              for (let i = 0; i < cids.length; i++) {
                const cid = cids[i];
                if (!cacheHits.find((e) => e.cid === cid)) {
                  missingCids.push(cid);
                }
              }
              const items = await mongoDBInterface.find({
                cid: { $in: missingCids },
              });
              for (let i = 0; i < items.length; i++) {
                const item = items[i];
                cacheHandler.set(item._id.toHexString(), item);
              }
              return [...cacheHits, ...items];
            },
          };
        },
      });
    }
  }

  return tempRepo;
}
