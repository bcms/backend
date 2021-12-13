import { BCMSConfig } from '@bcms/config';
import { BCMSRepo } from '@bcms/repo';
import { BCMSChange, BCMSChangeFSDBSchema } from '@bcms/types';
import {
  BCMSChangeTimeMongoDBSchema,
  BCMSChangeRepositoryMethods,
} from '@bcms/types/change';
import { createFSDBRepository } from '@becomes/purple-cheetah-mod-fsdb';
import { createMongoDBCachedRepository } from '@becomes/purple-cheetah-mod-mongodb';
import type { Module } from '@becomes/purple-cheetah/types';

export function createBcmsChangeRepository(): Module {
  return {
    name: 'Create change repository',
    initialize({ next }) {
      const name = 'Change repository';
      const collection = `${BCMSConfig.database.prefix}_changes`;

      BCMSRepo.change = BCMSConfig.database.fs
        ? createFSDBRepository<BCMSChange, BCMSChangeRepositoryMethods>({
            name,
            collection,
            schema: BCMSChangeFSDBSchema,
            methods({ repo }) {
              return {
                async updateAndInc(change) {
                  change.count++;
                  return await repo.update(change);
                },
                async updateAndIncByName(changeName) {
                  const change = await repo.findBy(
                    (e) => e.name === changeName,
                  );
                  if (change) {
                    change.count++;
                    return await repo.update(change);
                  }
                  return null;
                },
              };
            },
          })
        : createMongoDBCachedRepository<
            BCMSChange,
            BCMSChangeRepositoryMethods,
            void
          >({
            name: name,
            collection,
            schema: BCMSChangeTimeMongoDBSchema,
            methods({ mongoDBInterface, cacheHandler }) {
              return {
                async updateAndInc(change) {
                  const result = await mongoDBInterface.findOneAndUpdate(
                    { _id: change._id },
                    {
                      $inc: { count: 1 },
                    },
                  );
                  if (result) {
                    cacheHandler.set(result._id, result);
                  }
                  return result;
                },
                async updateAndIncByName(changeName) {
                  const result = await mongoDBInterface.findOneAndUpdate(
                    { name: changeName },
                    {
                      $inc: { count: 1 },
                    },
                  );
                  if (result) {
                    cacheHandler.set(result._id, result);
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
