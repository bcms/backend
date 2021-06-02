import type {
  FSDBRepository,
  MongoDBCachedRepository,
} from '@becomes/purple-cheetah/types';
import type { UserFSDB, UserMongoDB } from './models';

export type UserFSDBRepository = FSDBRepository<
  UserFSDB,
  { findByEmail(email: string): Promise<UserFSDB | null> }
>;

export type UserMongoDBRepository = MongoDBCachedRepository<
  UserMongoDB,
  { findByEmail(email: string): Promise<UserMongoDB | null> }
>;
