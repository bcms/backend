import { useBcmsConfig } from '../config';
import {
  createFSDBRepository,
  createMongoDBCachedRepository,
} from '@becomes/purple-cheetah';
import {
  UserFSDB,
  UserFSDBSchema,
  UserMongoDB,
  UserMongoDBSchema,
  UserRepository,
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
      { findByEmail(email: string): Promise<UserFSDB | null> }
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
      { findByEmail(email: string): Promise<UserMongoDB | null> },
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
