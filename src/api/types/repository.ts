import type { FSDBRepository } from '@becomes/purple-cheetah-mod-fsdb/types';
import type { MongoDBCachedRepository } from '@becomes/purple-cheetah-mod-mongodb/types';
import type { BCMSApiKeyFSDB, BCMSApiKeyMongoDB } from './models';

export type BCMSApiKeyMongoDBRepository = MongoDBCachedRepository<
  BCMSApiKeyMongoDB,
  undefined
>;

export type BCMSApiKeyFSDBRepository = FSDBRepository<
  BCMSApiKeyFSDB,
  undefined
>;

export type BCMSApiKeyRepository =
  | BCMSApiKeyMongoDBRepository
  | BCMSApiKeyFSDBRepository;
