import { BCMSConfig } from '@bcms/config';
import { BCMSRepo } from '@bcms/repo';
import { createFSDBRepository } from '@becomes/purple-cheetah-mod-fsdb';
import { createMongoDBCachedRepository } from '@becomes/purple-cheetah-mod-mongodb';
import type { Module } from '@becomes/purple-cheetah/types';
import {
  BCMSEntryFSDB,
  BCMSEntryFSDBSchema,
  BCMSEntryMongoDB,
  BCMSEntryMongoDBSchema,
  BCMSEntryRepositoryMethods,
  BCMSPropValueWidgetData,
} from '../types';

export function createBcmsEntryRepository(): Module {
  return {
    name: 'Create entry repository',
    initialize({ next }) {
      const nm = 'Entry repository';
      const collection = `${BCMSConfig.database.prefix}_entries`;

      BCMSRepo.entry = BCMSConfig.database.fs
        ? createFSDBRepository<
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
                async findByTemplateIdAndId(templateId, entryId) {
                  return await repo.findBy(
                    (e) => e._id === entryId && e.templateId === templateId,
                  );
                },
                async findAllByStatus(status) {
                  return await repo.findAllBy((e) => e.status === status);
                },
                async findAllByTemplateId(templateId) {
                  return await repo.findAllBy(
                    (e) => e.templateId === templateId,
                  );
                },
                async findAllByWidgetId(widgetId) {
                  return await repo.findAllBy(
                    (e) =>
                      !!e.content.find((langContent) =>
                        langContent.nodes.find(
                          (node) =>
                            node.attrs &&
                            (node.attrs as BCMSPropValueWidgetData)._id ===
                              widgetId,
                        ),
                      ),
                  );
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
                  return (
                    await repo.findAllBy((e) => e.templateId === templateId)
                  ).length;
                },
              };
            },
          })
        : createMongoDBCachedRepository<
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
                widget: {
                  [id: string]: boolean;
                };
              } = {
                status: {},
                template: {},
                widget: {},
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
                    cacheHandler.set(`${item._id}`, item);
                  }
                  return item;
                },
                async findByTemplateIdAndId(templateId, entryId) {
                  const cacheHit = cacheHandler.findOne(
                    (e) =>
                      `${e._id}` === entryId &&
                      e.templateId === templateId,
                  );
                  if (cacheHit) {
                    return cacheHit;
                  }
                  const item = await mongoDBInterface.findOne({
                    _id: entryId,
                    templateId,
                  });
                  if (item) {
                    cacheHandler.set(`${item._id}`, item);
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
                    cacheHandler.set(`${item._id}`, item);
                  }
                  latches.status[status] = true;
                  return items;
                },
                async findAllByTemplateId(templateId) {
                  if (latches.template[templateId]) {
                    return cacheHandler.find(
                      (e) => e.templateId === templateId,
                    );
                  }
                  const items = await mongoDBInterface.find({ templateId });
                  for (let i = 0; i < items.length; i++) {
                    const item = items[i];
                    cacheHandler.set(`${item._id}`, item);
                  }
                  latches.template[templateId] = true;
                  return items;
                },
                async findAllByWidgetId(widgetId) {
                  if (latches.widget[widgetId]) {
                    return cacheHandler.find(
                      (e) =>
                        !!e.content.find((langContent) =>
                          langContent.nodes.find(
                            (node) =>
                              node.attrs &&
                              (node.attrs as BCMSPropValueWidgetData)._id ===
                                widgetId,
                          ),
                        ),
                    );
                  }
                  const items: BCMSEntryMongoDB[] = await mongoDBInterface.find(
                    {
                      'content.nodes.attrs._id': widgetId,
                    },
                  );
                  for (let i = 0; i < items.length; i++) {
                    const item = items[i];
                    cacheHandler.set(`${item._id}`, item);
                  }
                  return items;
                },
                async clearAllStatuses(status) {
                  await mongoDBInterface.updateMany(
                    { status },
                    { $set: { status: '' } },
                  );
                  const cacheItems = cacheHandler.find(
                    (e) => e.status === status,
                  );
                  for (let i = 0; i < cacheItems.length; i++) {
                    const item = cacheItems[i];
                    item.status = '';
                    cacheHandler.set(`${item._id}`, item);
                  }
                },
                async deleteAllByTemplateId(templateId) {
                  await mongoDBInterface.deleteMany({ templateId });
                  const cacheItems = cacheHandler.find(
                    (e) => e.templateId === templateId,
                  );
                  for (let i = 0; i < cacheItems.length; i++) {
                    const item = cacheItems[i];
                    cacheHandler.remove(`${item._id}`);
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

      next();
    },
  };
}
