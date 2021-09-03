import { BCMSConfig } from '@bcms/config';
import { BCMSFactory } from '@bcms/factory';
import { BCMSRepo } from '@bcms/repo';
import type { BCMSStatusCross } from '@bcms/types';
import { useStringUtility } from '@becomes/purple-cheetah';
import { createFSDBRepository } from '@becomes/purple-cheetah-mod-fsdb';
import { createMongoDBCachedRepository } from '@becomes/purple-cheetah-mod-mongodb';
import type { Module } from '@becomes/purple-cheetah/types';
import {
  BCMSStatusFSDB,
  BCMSStatusFSDBSchema,
  BCMSStatusMongoDB,
  BCMSStatusMongoDBSchema,
  BCMSStatusRepositoryMethods,
} from '../types';

export function createBcmsStatusRepository(): Module {
  return {
    name: 'Create status repository',
    initialize({ next }) {
      const name = 'Status repository';
      const collection = `${BCMSConfig.database.prefix}_statuses`;

      BCMSRepo.status = BCMSConfig.database.fs
        ? createFSDBRepository<
            BCMSStatusFSDB,
            BCMSStatusRepositoryMethods<BCMSStatusFSDB>
          >({
            name,
            collection,
            schema: BCMSStatusFSDBSchema,
            methods({ repo }) {
              return {
                async findByName(nm) {
                  return await repo.findBy((e) => e.name === nm);
                },
              };
            },
          })
        : createMongoDBCachedRepository<
            BCMSStatusMongoDB,
            BCMSStatusRepositoryMethods<BCMSStatusMongoDB>,
            unknown
          >({
            name,
            collection,
            schema: BCMSStatusMongoDBSchema,
            methods({ mongoDBInterface, cacheHandler }) {
              return {
                async findByName(nm) {
                  const cacheHit = cacheHandler.findOne((e) => e.name === nm);
                  if (cacheHit) {
                    return cacheHit;
                  }
                  const status = await mongoDBInterface.findOne({ name: nm });
                  if (status) {
                    cacheHandler.set(status._id.toHexString(), status);
                  }
                  return status;
                },
              };
            },
          });

      BCMSRepo.status.methods
        .findByName('Draft')
        .then(async (draftStatus) => {
          const stringUtil = useStringUtility();
          if (!draftStatus) {
            await BCMSRepo.status.add(
              BCMSFactory.status.create({
                label: 'Draft',
                name: stringUtil.toSlugUnderscore('Draft'),
              }) as BCMSStatusCross,
            );
          }
          const activeStatus = await BCMSRepo.status.methods.findByName('Active');
          if (!activeStatus) {
            await BCMSRepo.status.add(
              BCMSFactory.status.create({
                label: 'Active',
                name: stringUtil.toSlugUnderscore('Active'),
              }) as never,
            );
          }
        })
        .catch((error) => {
          next(error);
        });
    },
  };
}
