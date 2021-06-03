import {
  BCMSGroupFSDB,
  BCMSGroupMongoDB,
  BCMSGroupRepository,
  BCMSGroupFSDBSchema,
  BCMSGroupMongoDBSchema,
  BCMSGroupRepositoryMethods,
} from '../types';
import { useBcmsConfig } from '../config';
import {
  createFSDBRepository,
  createMongoDBCachedRepository,
} from '@becomes/purple-cheetah';

let repository: BCMSGroupRepository;

export function useBcmsGroupRepository(): BCMSGroupRepository {
  if (repository) {
    return repository;
  }
  const bcmsConfig = useBcmsConfig();
  const name = 'Group repository';
  const collection = `${bcmsConfig.database.prefix}_groups`;

  if (bcmsConfig.database.fs) {
    repository = createFSDBRepository<
      BCMSGroupFSDB,
      BCMSGroupRepositoryMethods
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
    repository = createMongoDBCachedRepository<
      BCMSGroupMongoDB,
      BCMSGroupRepositoryMethods,
      unknown
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
  return repository;
}
