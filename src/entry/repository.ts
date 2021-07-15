import { createFSDBRepository } from '@becomes/purple-cheetah-mod-fsdb';
import { createMongoDBCachedRepository } from '@becomes/purple-cheetah-mod-mongodb';
import { useBcmsConfig } from '../config';
import {
  BCMSEntryFSDB,
  BCMSEntryFSDBSchema,
  BCMSEntryMongoDB,
  BCMSEntryMongoDBSchema,
  BCMSEntryRepository,
  BCMSEntryRepositoryMethods,
} from '../types';

let entryRepo: BCMSEntryRepository;

export function useBcmsEntryRepository(): BCMSEntryRepository {
  if (!entryRepo) {
    const bcmsConfig = useBcmsConfig();
    const nm = 'Entry repository';
    const collection = `${bcmsConfig.database.prefix}_entries`;

    if (bcmsConfig.database.fs) {
      entryRepo = createFSDBRepository<
        BCMSEntryFSDB,
        BCMSEntryRepositoryMethods<BCMSEntryFSDB>
      >({
        name: nm,
        collection,
        schema: BCMSEntryFSDBSchema,
        methods({ repo }) {
          return {
            async findByTemplateIdAndCid(templateId, entryCid) {
              return await repo.findBy(
                (e) => e.cid === entryCid && e.templateId === templateId,
              );
            },
            async findAllByStatus(status) {
              return await repo.findAllBy((e) => e.status === status);
            },
            async findAllByTemplateId(templateId) {
              return await repo.findAllBy((e) => e.templateId === templateId);
            },
            async clearAllStatuses(status) {
              await repo.updateMany(
                (e) => e.status === status,
                (e) => {
                  e.status = '';
                  return e;
                },
              );
            },
            async deleteAllByTemplateId(templateId) {
              await repo.deleteMany((e) => e.templateId === templateId);
            },
            async countByTemplateId(templateId) {
              return (await repo.findAllBy((e) => e.templateId === templateId))
                .length;
            },
          };
        },
      });
    } else {
      entryRepo = createMongoDBCachedRepository<
        BCMSEntryMongoDB,
        BCMSEntryRepositoryMethods<BCMSEntryMongoDB>,
        unknown
      >({
        name: nm,
        collection,
        schema: BCMSEntryMongoDBSchema,
        methods({ mongoDBInterface, cacheHandler }) {
          const latches: {
            status: {
              [name: string]: boolean;
            };
            template: {
              [id: string]: boolean;
            };
          } = {
            status: {},
            template: {},
          };
          return {
            async findByTemplateIdAndCid(templateId, entryCid) {
              const cacheHit = cacheHandler.findOne(
                (e) => e.cid === entryCid && e.templateId === templateId,
              );
              if (cacheHit) {
                return cacheHit;
              }
              const item = await mongoDBInterface.findOne({
                cid: entryCid,
                templateId,
              });
              if (item) {
                cacheHandler.set(item._id.toHexString(), item);
              }
              return item;
            },
            async findAllByStatus(status) {
              if (latches.status[status]) {
                return cacheHandler.find((e) => e.status === status);
              }
              const items = await mongoDBInterface.find({ status });
              for (let i = 0; i < items.length; i++) {
                const item = items[i];
                cacheHandler.set(item._id.toHexString(), item);
              }
              latches.status[status] = true;
              return items;
            },
            async findAllByTemplateId(templateId) {
              if (latches.template[templateId]) {
                return cacheHandler.find((e) => e.templateId === templateId);
              }
              const items = await mongoDBInterface.find({ templateId });
              for (let i = 0; i < items.length; i++) {
                const item = items[i];
                cacheHandler.set(item._id.toHexString(), item);
              }
              latches.template[templateId] = true;
              return items;
            },
            async clearAllStatuses(status) {
              await mongoDBInterface.updateMany(
                { status },
                { $set: { status: '' } },
              );
              const cacheItems = cacheHandler.find((e) => e.status === status);
              for (let i = 0; i < cacheItems.length; i++) {
                const item = cacheItems[i];
                item.status = '';
                cacheHandler.set(item._id.toHexString(), item);
              }
            },
            async deleteAllByTemplateId(templateId) {
              await mongoDBInterface.deleteMany({ templateId });
              const cacheItems = cacheHandler.find(
                (e) => e.templateId === templateId,
              );
              for (let i = 0; i < cacheItems.length; i++) {
                const item = cacheItems[i];
                cacheHandler.remove(item._id.toHexString());
              }
            },
            async countByTemplateId(templateId) {
              if (latches.template[templateId]) {
                return cacheHandler.find((e) => e.templateId === templateId)
                  .length;
              }
              return await mongoDBInterface
                .find({ templateId })
                .countDocuments();
            },
          };
        },
      });
    }
  }

  return entryRepo;
}
