import { BCMSConfig } from '@bcms/config';
import { BCMSRepo } from '@bcms/repo';
import { BCMSChange, BCMSChangeFSDBSchema } from '@bcms/types';
import {
  BCMSChangeTimeMongoDBSchema,
  BCMSChangeRepositoryMethods,
} from '@bcms/types/changes';
import { createFSDBRepository } from '@becomes/purple-cheetah-mod-fsdb';
import { createMongoDBRepository } from '@becomes/purple-cheetah-mod-mongodb';
import type { Module } from '@becomes/purple-cheetah/types';
import { request } from 'express';

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
                async showAll() {
                  const change = await repo.findAll();
                  if (change) {
                    if (request.route('/api/color')) {
                      change[0].color += 1;
                    }
                  }
                  return await BCMSRepo.change.update(change[0]);
                },
              };
            },
          })
        : createMongoDBRepository<BCMSChange, BCMSChangeRepositoryMethods>({
            name: name,
            collection,
            schema: BCMSChangeTimeMongoDBSchema,
            methods({ mongoDBInterface }) {
              return {
                async showAll() {
                  const d = await mongoDBInterface.updateMany({
                   $set: {"color": "1"}
                  });
                    return d;
                },
              };
            },
          });

      next();
    },
  };
}
