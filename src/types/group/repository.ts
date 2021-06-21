import type { FSDBRepository } from '@becomes/purple-cheetah-mod-fsdb/types';
import type { MongoDBCachedRepository } from '@becomes/purple-cheetah-mod-mongodb/types';
import type { BCMSGroupFSDB, BCMSGroupMongoDB } from './models';

export interface BCMSGroupRepositoryMethods<Entity> {
  findByName(name: string): Promise<Entity | null>;
}

export type BCMSGroupFSDBRepository = FSDBRepository<
  BCMSGroupFSDB,
  BCMSGroupRepositoryMethods<BCMSGroupFSDB>
>;
export type BCMSGroupMongoDBRepository = MongoDBCachedRepository<
  BCMSGroupMongoDB,
  BCMSGroupRepositoryMethods<BCMSGroupMongoDB>
>;

export type BCMSGroupRepository =
  | BCMSGroupMongoDBRepository
  | BCMSGroupFSDBRepository;
