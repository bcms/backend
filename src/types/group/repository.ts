import type {
  FSDBRepository,
  MongoDBCachedRepository,
} from '@becomes/purple-cheetah/types';
import type { BCMSGroup, BCMSGroupFSDB, BCMSGroupMongoDB } from './models';

export interface BCMSGroupRepositoryMethods {
  findByName(name: string): Promise<BCMSGroup | null>;
}

export type BCMSGroupFSDBRepository = FSDBRepository<
  BCMSGroupFSDB,
  BCMSGroupRepositoryMethods
>;
export type BCMSGroupMongoDBRepository = MongoDBCachedRepository<
  BCMSGroupMongoDB,
  BCMSGroupRepositoryMethods
>;

export type BCMSGroupRepository =
  | BCMSGroupMongoDBRepository
  | BCMSGroupFSDBRepository;
