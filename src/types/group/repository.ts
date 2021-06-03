import type {
  FSDBRepository,
  MongoDBRepository,
} from '@becomes/purple-cheetah/types';
import type { BCMSGroupFSDB, BCMSGroupMongoDB } from './models';

export type BCMSGroupFSDBRepository = FSDBRepository<BCMSGroupFSDB, unknown>;
export type BCMSGroupMongoDBRepository = MongoDBRepository<
  BCMSGroupMongoDB,
  unknown
>;

export type BCMSGroupRepository = BCMSGroupMongoDBRepository | BCMSGroupFSDB;
