import { createFSDBRepository } from '@becomes/purple-cheetah-mod-fsdb';
import { createMongoDBCachedRepository } from '@becomes/purple-cheetah-mod-mongodb';
import { useBcmsConfig } from '../config';
import {
  BCMSApiKeyAccessFSDBSchema,
  BCMSApiKeyFSDB,
  BCMSApiKeyMongoDB,
  BCMSApiKeyMongoDBSchema,
  BCMSApiKeyRepository,
} from './types';

let apiKeyRepo: BCMSApiKeyRepository;

export function useBcmsApiKeyRepository(): BCMSApiKeyRepository {
  if (!apiKeyRepo) {
    const bcmsConfig = useBcmsConfig();
    const name = 'Api key repository';
    const collection = `${bcmsConfig.database.prefix}_api_keys`;

    if (bcmsConfig.database.fs) {
      apiKeyRepo = createFSDBRepository<BCMSApiKeyFSDB, undefined>({
        name,
        collection,
        schema: BCMSApiKeyAccessFSDBSchema,
      });
    } else {
      apiKeyRepo = createMongoDBCachedRepository<
        BCMSApiKeyMongoDB,
        undefined,
        undefined
      >({
        name,
        collection,
        schema: BCMSApiKeyMongoDBSchema,
      });
    }
  }
  return apiKeyRepo;
}
