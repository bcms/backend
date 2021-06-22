import { createFSDBRepository } from '@becomes/purple-cheetah-mod-fsdb';
import { createMongoDBCachedRepository } from '@becomes/purple-cheetah-mod-mongodb';
import { useBcmsConfig } from '../config';
import {
  UserFSDB,
  UserFSDBSchema,
  UserMongoDB,
  UserMongoDBSchema,
  UserRepository,
  UserRepositoryMethods,
} from '../types';

let repository: UserRepository;

export function useUserRepository(): UserRepository {
  if (repository) {
    return repository;
  }
  const bcmsConfig = useBcmsConfig();
  const name = 'User repository';
  const collection = `${bcmsConfig.database.prefix}_users`;

  if (bcmsConfig.database.fs) {
    repository = createFSDBRepository<
      UserFSDB,
      UserRepositoryMethods<UserFSDB>
    >({
      collection,
      name,
      schema: UserFSDBSchema,
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
      UserMongoDB,
      UserRepositoryMethods<UserMongoDB>,
      undefined
    >({
      name,
      collection,
      schema: UserMongoDBSchema,
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
