import { createFSDBRepository } from '@becomes/purple-cheetah-mod-fsdb';
import { createMongoDBRepository } from '@becomes/purple-cheetah-mod-mongodb';
import { useBcmsConfig } from '../config';
import {
  BCMSIdCounterFSDB,
  BCMSIdCounterFSDBSchema,
  BCMSIdCounterMongoDB,
  BCMSIdCounterMongoDBSchema,
  BCMSIdCounterRepository,
  BCMSIdCounterRepositoryMethods,
} from '../types';

let idcRepo: BCMSIdCounterRepository;

export function useBcmsIdCounterRepository(): BCMSIdCounterRepository {
  if (!idcRepo) {
    const bcmsConfig = useBcmsConfig();
    const nm = 'ID counter repository';
    const collection = `${bcmsConfig.database.prefix}_id_counters`;

    if (!bcmsConfig.database.fs) {
      idcRepo = createMongoDBRepository<
        BCMSIdCounterMongoDB,
        BCMSIdCounterRepositoryMethods<BCMSIdCounterMongoDB>
      >({
        name: nm,
        collection,
        schema: BCMSIdCounterMongoDBSchema,
        methods({ mongoDBInterface }) {
          return {
            async findByForId(forId) {
              return await mongoDBInterface.findOne({ forId });
            },
            async findAndIncByForId(forId) {
              const item = await mongoDBInterface.findOneAndUpdate(
                { forId },
                { $inc: { count: 1 } },
              );
              if (item) {
                return item.count;
              }
              return null;
            },
          };
        },
      });
    } else {
      idcRepo = createFSDBRepository<
        BCMSIdCounterFSDB,
        BCMSIdCounterRepositoryMethods<BCMSIdCounterFSDB>
      >({
        name: nm,
        collection,
        schema: BCMSIdCounterFSDBSchema,
        methods({ repo }) {
          return {
            async findAndIncByForId(forId) {
              const item = await repo.findBy((e) => e.forId === forId);
              if (item) {
                const count = item.count + 0;
                item.count++;
                await repo.update(item);
                return count;
              }
              return null;
            },
            async findByForId(forId) {
              return await repo.findBy((e) => e.forId === forId);
            },
          };
        },
      });
    }
  }
  return idcRepo;
}
