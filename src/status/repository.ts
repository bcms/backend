import { BCMSConfig } from '@bcms/config';
import { BCMSFactory } from '@bcms/factory';
import { BCMSRepo } from '@bcms/repo';
import { useStringUtility } from '@becomes/purple-cheetah';
import { createFSDBRepository } from '@becomes/purple-cheetah-mod-fsdb';
import { createMongoDBCachedRepository } from '@becomes/purple-cheetah-mod-mongodb';
import type { Module } from '@becomes/purple-cheetah/types';
import {
  BCMSStatus,
  BCMSStatusFSDBSchema,
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
        ? createFSDBRepository<BCMSStatus, BCMSStatusRepositoryMethods>({
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
            BCMSStatus,
            BCMSStatusRepositoryMethods,
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
                    cacheHandler.set(status._id, status);
                  }
                  return status;
                },
              };
            },
          });

      const stringUtil = useStringUtility();
      BCMSRepo.status.methods
        .findByName(stringUtil.toSlugUnderscore('Draft'))
        .then(async (draftStatus) => {
          if (!draftStatus) {
            await BCMSRepo.status.add(
              BCMSFactory.status.create({
                label: 'Draft',
                name: stringUtil.toSlugUnderscore('Draft'),
              }),
            );
          }
          const activeStatus = await BCMSRepo.status.methods.findByName(
            stringUtil.toSlugUnderscore('Active'),
          );
          if (!activeStatus) {
            await BCMSRepo.status.add(
              BCMSFactory.status.create({
                label: 'Active',
                name: stringUtil.toSlugUnderscore('Active'),
              }),
            );
          }
          next();
        })
        .catch((error) => {
          next(error);
        });
    },
  };
}
