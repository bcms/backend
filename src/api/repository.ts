import { BCMSConfig } from '@bcms/config';
import { BCMSRepo } from '@bcms/repo';
import { createFSDBRepository } from '@becomes/purple-cheetah-mod-fsdb';
import { createMongoDBCachedRepository } from '@becomes/purple-cheetah-mod-mongodb';
import type { Module } from '@becomes/purple-cheetah/types';
import {
  BCMSApiKeyAccessFSDBSchema,
  BCMSApiKeyFSDB,
  BCMSApiKeyMongoDB,
  BCMSApiKeyMongoDBSchema,
} from '../types';

export function createBcmsApiKeyRepository(): Module {
  return {
    name: 'Create api key repository',
    initialize({ next }) {
      const name = 'Api key repository';
      const collection = `${BCMSConfig.database.prefix}_api_keys`;

      BCMSRepo.apiKey = BCMSConfig.database.fs
        ? createFSDBRepository<BCMSApiKeyFSDB, undefined>({
            name,
            collection,
            schema: BCMSApiKeyAccessFSDBSchema,
          })
        : createMongoDBCachedRepository<
            BCMSApiKeyMongoDB,
            undefined,
            undefined
          >({
            name,
            collection,
            schema: BCMSApiKeyMongoDBSchema,
          });

      next();
    },
  };
  // if (!apiKeyRepo) {
  //   if (bcmsConfig.database.fs) {
  //     apiKeyRepo = createFSDBRepository<BCMSApiKeyFSDB, undefined>({
  //       name,
  //       collection,
  //       schema: BCMSApiKeyAccessFSDBSchema,
  //     });
  //   } else {
  //     apiKeyRepo = createMongoDBCachedRepository<
  //       BCMSApiKeyMongoDB,
  //       undefined,
  //       undefined
  //     >({
  //       name,
  //       collection,
  //       schema: BCMSApiKeyMongoDBSchema,
  //     });
  //   }
  // }
  // return apiKeyRepo;
}
