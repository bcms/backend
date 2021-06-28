import { createFSDBRepository } from '@becomes/purple-cheetah-mod-fsdb';
import { createMongoDBCachedRepository } from '@becomes/purple-cheetah-mod-mongodb';
import { useBcmsConfig } from '../config';
import {
  BCMSUserFSDB,
  BCMSUserFSDBSchema,
  BCMSUserMongoDB,
  BCMSUserMongoDBSchema,
  BCMSUserRepository,
  BCMSUserRepositoryMethods,
} from './types';

let repository: BCMSUserRepository;

export function useUserRepository(): BCMSUserRepository {
  if (repository) {
    return repository;
  }
  const bcmsConfig = useBcmsConfig();
  const name = 'User repository';
  const collection = `${bcmsConfig.database.prefix}_users`;

  if (bcmsConfig.database.fs) {
    repository = createFSDBRepository<
      BCMSUserFSDB,
      BCMSUserRepositoryMethods<BCMSUserFSDB>
    >({
      collection,
      name,
      schema: BCMSUserFSDBSchema,
      methods({ repo }) {
        return {
          async findByEmail(email) {
            return await repo.findBy((e) => e.email === email);
          },
        };
      },
    });
  } else {
    repository = createMongoDBCachedRepository<
      BCMSUserMongoDB,
      BCMSUserRepositoryMethods<BCMSUserMongoDB>,
      undefined
    >({
      name,
      collection,
      schema: BCMSUserMongoDBSchema,
      methods({ mongoDBInterface, cacheHandler }) {
        return {
          async findByEmail(email) {
            const cacheHit = cacheHandler.findOne((e) => e.email === email);
            if (cacheHit) {
              return cacheHit;
            }
            const result = await mongoDBInterface.findOne({ email });
            if (result) {
              cacheHandler.set(result._id.toHexString(), result);
            }
            return result;
          },
        };
      },
    });
  }
  return repository;
}
