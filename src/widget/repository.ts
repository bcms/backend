import { BCMSConfig } from '@bcms/config';
import { BCMSRepo } from '@bcms/repo';
import { createFSDBRepository } from '@becomes/purple-cheetah-mod-fsdb';
import { createMongoDBCachedRepository } from '@becomes/purple-cheetah-mod-mongodb';
import type { Module } from '@becomes/purple-cheetah/types';
import {
  BCMSPropEntryPointerData,
  BCMSPropGroupPointerData,
  BCMSPropType,
  BCMSWidgetFSDB,
  BCMSWidgetFSDBSchema,
  BCMSWidgetMongoDB,
  BCMSWidgetMongoDBSchema,
  BCMSWidgetRepositoryMethods,
} from '../types';

export function createBcmsWidgetRepository(): Module {
  return {
    name: 'Create widget repository',
    initialize({ next }) {
      const nm = 'Widget repository';
      const collection = `${BCMSConfig.database.prefix}_widgets`;

      BCMSRepo.widget = BCMSConfig.database.fs
        ? createFSDBRepository<
            BCMSWidgetFSDB,
            BCMSWidgetRepositoryMethods<BCMSWidgetFSDB>
          >({
            name: nm,
            collection,
            schema: BCMSWidgetFSDBSchema,
            methods({ repo }) {
              return {
                async findByName(name) {
                  return await repo.findBy((e) => e.name === name);
                },
                async findByCid(cid) {
                  return await repo.findBy((e) => e.cid === cid);
                },
                async findAllByCid(cids) {
                  return await repo.findAllBy((e) => cids.includes(e.cid));
                },
                async findAllByPropGroupPointer(groupId) {
                  return await repo.findAllBy(
                    (e) =>
                      !!e.props.find(
                        (p) =>
                          p.type === BCMSPropType.GROUP_POINTER &&
                          (p.defaultData as BCMSPropGroupPointerData)._id ===
                            groupId,
                      ),
                  );
                },
                async findAllByPropEntryPointer(templateId) {
                  return await repo.findAllBy(
                    (e) =>
                      !!e.props.find(
                        (p) =>
                          p.type === BCMSPropType.ENTRY_POINTER &&
                          (p.defaultData as BCMSPropEntryPointerData)
                            .templateId === templateId,
                      ),
                  );
                },
              };
            },
          })
        : createMongoDBCachedRepository<
            BCMSWidgetMongoDB,
            BCMSWidgetRepositoryMethods<BCMSWidgetMongoDB>,
            unknown
          >({
            name: nm,
            collection,
            schema: BCMSWidgetMongoDBSchema,
            methods({ mongoDBInterface, cacheHandler }) {
              return {
                async findByName(name) {
                  const cacheHit = cacheHandler.findOne((e) => e.name === name);
                  if (cacheHit) {
                    return cacheHit;
                  }
                  const widget = await mongoDBInterface.findOne({ name });
                  if (widget) {
                    cacheHandler.set(`${widget._id}`, widget);
                  }
                  return widget;
                },
                async findByCid(cid) {
                  const cacheHit = cacheHandler.findOne((e) => e.cid === cid);
                  if (cacheHit) {
                    return cacheHit;
                  }
                  const widget = await mongoDBInterface.findOne({ cid });
                  if (widget) {
                    cacheHandler.set(`${widget._id}`, widget);
                  }
                  return widget;
                },
                async findAllByCid(cids) {
                  const missingCids: string[] = [];
                  const output: BCMSWidgetMongoDB[] = cacheHandler.find((e) => {
                    const found = cids.includes(e.cid);
                    if (!found) {
                      missingCids.push(e.cid);
                    }
                    return found;
                  });
                  if (missingCids.length > 0) {
                    const items = await mongoDBInterface.find({
                      cid: { $in: missingCids },
                    });
                    for (let i = 0; i < items.length; i++) {
                      const item = items[i];
                      cacheHandler.set(`${item._id}`, item);
                      output.push(item);
                    }
                  }
                  return output;
                },
                async findAllByPropGroupPointer(groupId) {
                  return await mongoDBInterface.find({
                    'props.type': BCMSPropType.GROUP_POINTER,
                    'props.defaultData._id': groupId,
                  });
                },
                async findAllByPropEntryPointer(templateId) {
                  return await mongoDBInterface.find({
                    'props.type': BCMSPropType.ENTRY_POINTER,
                    'props.defaultData.templateId': templateId,
                  });
                },
              };
            },
          });

      next();
    },
  };
}
