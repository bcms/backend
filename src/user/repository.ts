import { BCMSConfig } from '@bcms/config';
import { BCMSRepo } from '@bcms/repo';
import { createFSDBRepository } from '@becomes/purple-cheetah-mod-fsdb';
import { createMongoDBCachedRepository } from '@becomes/purple-cheetah-mod-mongodb';
import type { Module } from '@becomes/purple-cheetah/types';
import {
  BCMSUserFSDB,
  BCMSUserFSDBSchema,
  BCMSUserMongoDB,
  BCMSUserMongoDBSchema,
  BCMSUserRepositoryMethods,
} from '../types';

export function createBcmsUserRepository(): Module {
  return {
    name: 'Create user repository',
    initialize({ next }) {
      const name = 'User repository';
      const collection = `${BCMSConfig.database.prefix}_users`;

      BCMSRepo.user = BCMSConfig.database.fs
        ? createFSDBRepository<
            BCMSUserFSDB,
            BCMSUserRepositoryMethods<BCMSUserFSDB>
          >({
            collection,
            name,
            schema: BCMSUserFSDBSchema,
            methods({ repo }) {
              return {
                async findByEmail(email) {
                  return await repo.findBy((e) => e.email === email);
                },
              };
            },
          })
        : createMongoDBCachedRepository<
            BCMSUserMongoDB,
            BCMSUserRepositoryMethods<BCMSUserMongoDB>,
            undefined
          >({
            name,
            collection,
            schema: BCMSUserMongoDBSchema,
            methods({ mongoDBInterface, cacheHandler }) {
              return {
                async findByEmail(email) {
                  const cacheHit = cacheHandler.findOne(
                    (e) => e.email === email,
                  );
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

      next();
    },
  };
}
