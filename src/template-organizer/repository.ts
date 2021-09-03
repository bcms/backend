import { BCMSConfig } from '@bcms/config';
import { BCMSRepo } from '@bcms/repo';
import { createFSDBRepository } from '@becomes/purple-cheetah-mod-fsdb';
import { createMongoDBCachedRepository } from '@becomes/purple-cheetah-mod-mongodb';
import type { Module } from '@becomes/purple-cheetah/types';
import {
  BCMSTemplateOrganizerFSDB,
  BCMSTemplateOrganizerFSDBSchema,
  BCMSTemplateOrganizerMongoDB,
  BCMSTemplateOrganizerMongoDBSchema,
  BCMSTemplateOrganizerRepositoryMethods,
} from '../types';

export function createBcmsTemplateOrganizerRepository(): Module {
  return {
    name: 'Create template organizer repository',
    initialize({ next }) {
      const latches: {
        parentId: {
          [id: string]: boolean;
        };
      } = { parentId: {} };
      const nm = 'Template organizer repository';
      const collection = `${BCMSConfig.database.prefix}_template_organizers`;

      BCMSRepo.templateOrganizer = BCMSConfig.database.fs
        ? createFSDBRepository<
            BCMSTemplateOrganizerFSDB,
            BCMSTemplateOrganizerRepositoryMethods<BCMSTemplateOrganizerFSDB>
          >({
            name: nm,
            collection,
            schema: BCMSTemplateOrganizerFSDBSchema,
            methods({ repo }) {
              return {
                async findAllByParentId(parentId) {
                  return await repo.findAllBy((e) => e.parentId === parentId);
                },
                async findByName(name) {
                  return await repo.findBy((e) => e.name === name);
                },
                async findByTemplateId(templateId) {
                  return await repo.findBy((e) =>
                    e.templateIds.includes(templateId),
                  );
                },
              };
            },
          })
        : createMongoDBCachedRepository<
            BCMSTemplateOrganizerMongoDB,
            BCMSTemplateOrganizerRepositoryMethods<BCMSTemplateOrganizerMongoDB>,
            unknown
          >({
            name: nm,
            collection,
            schema: BCMSTemplateOrganizerMongoDBSchema,
            methods({ mongoDBInterface, cacheHandler }) {
              return {
                async findAllByParentId(parentId) {
                  if (latches.parentId[parentId]) {
                    return cacheHandler.find((e) => e.parentId === parentId);
                  }
                  const items = await mongoDBInterface.find({ parentId });
                  for (let i = 0; i < items.length; i++) {
                    const item = items[i];
                    cacheHandler.set(item._id.toHexString(), item);
                  }
                  latches.parentId[parentId] = true;
                  return items;
                },
                async findByName(name) {
                  const cacheHit = cacheHandler.findOne((e) => e.name === name);
                  if (cacheHit) {
                    return cacheHit;
                  }
                  const item = await mongoDBInterface.findOne({ name });
                  if (item) {
                    cacheHandler.set(item._id.toHexString(), item);
                  }
                  return item;
                },
                async findByTemplateId(templateId) {
                  const cacheHit = cacheHandler.findOne((e) =>
                    e.templateIds.includes(templateId),
                  );
                  if (cacheHit) {
                    return cacheHit;
                  }
                  const item = await mongoDBInterface.findOne({
                    templateIds: templateId,
                  });
                  if (item) {
                    cacheHandler.set(item._id.toHexString(), item);
                  }
                  return item;
                },
              };
            },
          });

      next();
    },
  };
}
