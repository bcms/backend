import type { FSDBRepository } from '@becomes/purple-cheetah-mod-fsdb/types';
import type { MongoDBCachedRepository } from '@becomes/purple-cheetah-mod-mongodb/types';
import type { UserFSDB, UserMongoDB } from './models';

export type UserRepository = UserFSDBRepository | UserMongoDBRepository;

export interface UserRepositoryMethods<Entity> {
  findByEmail(email: string): Promise<Entity | null>;
}

export type UserFSDBRepository = FSDBRepository<
  UserFSDB,
  UserRepositoryMethods<UserFSDB>
>;

export type UserMongoDBRepository = MongoDBCachedRepository<
  UserMongoDB,
  UserRepositoryMethods<UserMongoDB>
>;
