import { BCMSConfig } from '@bcms/config';
import { BCMSRepo } from '@bcms/repo';
import {
  BCMSTag,
  BCMSTagFSDBSchema,
  BCMSTagMongoDBSchema,
  BCMSTagRepositoryMethods,
} from '@bcms/types';
import { createFSDBRepository } from '@becomes/purple-cheetah-mod-fsdb';
import { createMongoDBCachedRepository } from '@becomes/purple-cheetah-mod-mongodb';
import type { Module } from '@becomes/purple-cheetah/types';

export function createBcmsTagRepository(): Module {
  return {
    name: 'Create tag respoitory',
    initialize({ next }) {
      const name = 'Tag repository';
      const collection = `${BCMSConfig.database.prefix}_tags`;

      BCMSRepo.tag = BCMSConfig.database.fs
        ? createFSDBRepository<BCMSTag, BCMSTagRepositoryMethods>({
            name,
            collection,
            schema: BCMSTagFSDBSchema,
            methods({ repo }) {
              return {
                async findByValue(vl) {
                  return await repo.findBy((e) => e.value === vl);
                },
              };
            },
          })
        : createMongoDBCachedRepository<
            BCMSTag,
            BCMSTagRepositoryMethods,
            undefined
          >({
            name,
            collection,
            schema: BCMSTagMongoDBSchema,
            methods({ mongoDBInterface, cacheHandler }) {
              return {
                async findByValue(vl) {
                  const cacheHit = cacheHandler.findOne((e) => e.value === vl);
                  if (cacheHit) {
                    return cacheHit;
                  }
                  const tag = await mongoDBInterface.findOne({ value: vl });
                  if (tag) {
                    cacheHandler.set(tag._id, tag);
                  }
                  return tag;
                },
              };
            },
          });
      next();
    },
  };
}
