import { BCMSConfig } from '@bcms/config';
import { BCMSRepo } from '@bcms/repo';
import {
  BCMSColor,
  BCMSColorFSDBShema,
  BCMSColorMongoDBSchema,
  BCMSColorRepositoryMethods,
} from '@bcms/types';
import { createFSDBRepository } from '@becomes/purple-cheetah-mod-fsdb';
import { createMongoDBCachedRepository } from '@becomes/purple-cheetah-mod-mongodb';
import type { Module } from '@becomes/purple-cheetah/types';

export function createBcmsColorRepository(): Module {
  return {
    name: 'Create color repository',
    initialize({ next }) {
      const name = 'Color repository';
      const collection = `${BCMSConfig.database.prefix}_color`;

      BCMSRepo.color = BCMSConfig.database.fs
        ? createFSDBRepository<BCMSColor, BCMSColorRepositoryMethods>({
            name,
            collection,
            schema: BCMSColorFSDBShema,
            methods({ repo }) {
              return {
                async findByName(nm) {
                  return await repo.findBy((e) => e.name === nm);
                },
              };
            },
          })
        : createMongoDBCachedRepository<
            BCMSColor,
            BCMSColorRepositoryMethods,
            undefined
          >({
            name,
            collection,
            schema: BCMSColorMongoDBSchema,
            methods({ mongoDBInterface, cacheHandler }) {
              return {
                async findByName(nm) {
                  const cacheHit = cacheHandler.findOne((e) => e.name === nm);
                  if (cacheHit) {
                    return cacheHit;
                  }
                  const color = await mongoDBInterface.findOne({ name: nm });
                  if (color) {
                    cacheHandler.set(color._id, color);
                  }
                  return color;
                },
              };
            },
          });
      next();
    },
  };
}
