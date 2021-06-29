import { createFSDBRepository } from '@becomes/purple-cheetah-mod-fsdb';
import { createMongoDBCachedRepository } from '@becomes/purple-cheetah-mod-mongodb';
import { useBcmsConfig } from '../config';
import {
  BCMSStatusFSDB,
  BCMSStatusFSDBSchema,
  BCMSStatusMongoDB,
  BCMSStatusMongoDBSchema,
  BCMSStatusRepository,
  BCMSStatusRepositoryMethods,
} from './types';

let statusRepo: BCMSStatusRepository;

export function useBcmsStatusRepository(): BCMSStatusRepository {
  if (!statusRepo) {
    const bcmsConfig = useBcmsConfig();
    const name = 'Status repository';
    const collection = `${bcmsConfig.database.prefix}_statuses`;
    if (bcmsConfig.database.fs) {
      statusRepo = createFSDBRepository<
        BCMSStatusFSDB,
        BCMSStatusRepositoryMethods<BCMSStatusFSDB>
      >({
        name,
        collection,
        schema: BCMSStatusFSDBSchema,
        methods({ repo }) {
          return {
            async findByName(nm) {
              return await repo.findBy((e) => e.name === nm);
            },
          };
        },
      });
    } else {
      statusRepo = createMongoDBCachedRepository<
        BCMSStatusMongoDB,
        BCMSStatusRepositoryMethods<BCMSStatusMongoDB>,
        unknown
      >({
        name,
        collection,
        schema: BCMSStatusMongoDBSchema,
        methods({ mongoDBInterface, cacheHandler }) {
          return {
            async findByName(nm) {
              const cacheHit = cacheHandler.findOne((e) => e.name === nm);
              if (cacheHit) {
                return cacheHit;
              }
              const status = await mongoDBInterface.findOne({ name: nm });
              if (status) {
                cacheHandler.set(status._id.toHexString(), status);
              }
              return status;
            },
          };
        },
      });
    }
  }
  return statusRepo;
}
