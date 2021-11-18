import { BCMSConfig } from '@bcms/config';
import { BCMSRepo } from '@bcms/repo';
import { createFSDBRepository } from '@becomes/purple-cheetah-mod-fsdb';
import { createMongoDBCachedRepository } from '@becomes/purple-cheetah-mod-mongodb';
import type { Module } from '@becomes/purple-cheetah/types';
import {
  BCMSPropEntryPointerData,
  BCMSPropGroupPointerData,
  BCMSPropTagData,
  BCMSPropType,
  BCMSTemplate,
  BCMSTemplateFSDBSchema,
  BCMSTemplateMongoDBSchema,
  BCMSTemplateRepositoryMethods,
} from '../types';

export function createBcmsTemplateRepository(): Module {
  return {
    name: 'Create template repository',
    initialize({ next }) {
      const nm = 'Template repository';
      const collection = `${BCMSConfig.database.prefix}_templates`;

      BCMSRepo.template = BCMSConfig.database.fs
        ? createFSDBRepository<BCMSTemplate, BCMSTemplateRepositoryMethods>({
            name: nm,
            collection,
            schema: BCMSTemplateFSDBSchema,
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
                async findAllByPropTag(tagId) {
                  return await repo.findAllBy(
                    (e) =>
                      !!e.props.find(
                        (p) =>
                          p.type === BCMSPropType.TAG &&
                          (p.defaultData as BCMSPropTagData).includes(tagId),
                      ),
                  );
                },
              };
            },
          })
        : createMongoDBCachedRepository<
            BCMSTemplate,
            BCMSTemplateRepositoryMethods,
            unknown
          >({
            name: nm,
            collection,
            schema: BCMSTemplateMongoDBSchema,
            methods({ mongoDBInterface, cacheHandler }) {
              return {
                async findByName(name) {
                  const cacheHit = cacheHandler.findOne((e) => e.name === name);
                  if (cacheHit) {
                    return cacheHit;
                  }
                  const temp = await mongoDBInterface.findOne({ name });
                  if (temp) {
                    cacheHandler.set(temp._id, temp);
                  }
                  return temp;
                },
                async findByCid(cid) {
                  const cacheHit = cacheHandler.findOne((e) => e.cid === cid);
                  if (cacheHit) {
                    return cacheHit;
                  }
                  const item = await mongoDBInterface.findOne({ cid });
                  if (item) {
                    cacheHandler.set(item._id, item);
                  }
                  return item;
                },
                async findAllByCid(cids) {
                  const missingCids: string[] = [];
                  const output = cacheHandler.find((e) => {
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
                      cacheHandler.set(item._id, item);
                      output.push(item);
                    }
                  }
                  return output;
                },
                async findAllByPropGroupPointer(groupId) {
                  // TODO: Try to implement caching
                  return await mongoDBInterface.find({
                    'props.type': BCMSPropType.GROUP_POINTER,
                    'props.defaultData._id': groupId,
                  });
                },
                async findAllByPropEntryPointer(templateId) {
                  // TODO: Try to implement caching
                  return await mongoDBInterface.find({
                    'props.type': BCMSPropType.ENTRY_POINTER,
                    'props.defaultData.templateId': templateId,
                  });
                },
                async findAllByPropTag(tagId) {
                  // TODO: Try to implement caching
                  return await mongoDBInterface.find({
                    'props.type': BCMSPropType.TAG,
                    'props.defaultData': tagId,
                  });
                },
              };
            },
          });

      next();
    },
  };
}
