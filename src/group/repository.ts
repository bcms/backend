import { createFSDBRepository } from '@becomes/purple-cheetah-mod-fsdb';
import { createMongoDBCachedRepository } from '@becomes/purple-cheetah-mod-mongodb';
import { useBcmsConfig } from '../config';
import {
  BCMSGroupFSDB,
  BCMSGroupFSDBSchema,
  BCMSGroupMongoDB,
  BCMSGroupMongoDBSchema,
  BCMSGroupRepository,
  BCMSGroupRepositoryMethods,
} from './types';

let groupRepo: BCMSGroupRepository;

export function useBcmsGroupRepository(): BCMSGroupRepository {
  if (!groupRepo) {
    const bcmsConfig = useBcmsConfig();
    const name = 'Group repository';
    const collection = `${bcmsConfig.database.prefix}_groups`;
    if (bcmsConfig.database.fs) {
      groupRepo = createFSDBRepository<
        BCMSGroupFSDB,
        BCMSGroupRepositoryMethods<BCMSGroupFSDB>
      >({
        name,
        collection,
        schema: BCMSGroupFSDBSchema,
        methods({ repo }) {
          return {
            async findByName(nm) {
              return await repo.findBy((e) => e.name === nm);
            },
          };
        },
      });
    } else {
      groupRepo = createMongoDBCachedRepository<
        BCMSGroupMongoDB,
        BCMSGroupRepositoryMethods<BCMSGroupMongoDB>,
        undefined
      >({
        name,
        collection,
        schema: BCMSGroupMongoDBSchema,
        methods({ mongoDBInterface, cacheHandler }) {
          return {
            async findByName(nm) {
              const cacheHit = cacheHandler.findOne((e) => e.name === nm);
              if (cacheHit) {
                return cacheHit;
              }
              const group = await mongoDBInterface.findOne({ name: nm });
              if (group) {
                cacheHandler.set(group._id.toHexString(), group);
              }
              return group;
            },
          };
        },
      });
    }
  }

  return groupRepo;
}
