import type { FSDBRepository } from '@becomes/purple-cheetah-mod-fsdb/types';
import type { MongoDBCachedRepository } from '@becomes/purple-cheetah-mod-mongodb/types';
import type { BCMSUserFSDB, BCMSUserMongoDB } from './models';

export type BCMSUserRepository =
  | BCMSUserFSDBRepository
  | BCMSUserMongoDBRepository;

export interface BCMSUserRepositoryMethods<Entity> {
  findByEmail(email: string): Promise<Entity | null>;
}

export type BCMSUserFSDBRepository = FSDBRepository<
  BCMSUserFSDB,
  BCMSUserRepositoryMethods<BCMSUserFSDB>
>;

export type BCMSUserMongoDBRepository = MongoDBCachedRepository<
  BCMSUserMongoDB,
  BCMSUserRepositoryMethods<BCMSUserMongoDB>
>;
