import { createFSDBRepository } from '@becomes/purple-cheetah-mod-fsdb';
import { createMongoDBCachedRepository } from '@becomes/purple-cheetah-mod-mongodb';
import { useBcmsConfig } from '../config';
import {
  BCMSGroupFSDB,
  BCMSGroupFSDBSchema,
  BCMSGroupMongoDB,
  BCMSGroupMongoDBSchema,
  BCMSGroupRepository,
  BCMSGroupRepositoryMethods,
  BCMSPropEntryPointerData,
  BCMSPropGroupPointerData,
  BCMSPropType,
} from '../types';

let groupRepo: BCMSGroupRepository;

export function useBcmsGroupRepository(): BCMSGroupRepository {
  if (!groupRepo) {
    const bcmsConfig = useBcmsConfig();
    const name = 'Group repository';
    const collection = `${bcmsConfig.database.prefix}_groups`;
    if (bcmsConfig.database.fs) {
      groupRepo = createFSDBRepository<
        BCMSGroupFSDB,
        BCMSGroupRepositoryMethods<BCMSGroupFSDB>
      >({
        name,
        collection,
        schema: BCMSGroupFSDBSchema,
        methods({ repo }) {
          return {
            async findByName(nm) {
              return await repo.findBy((e) => e.name === nm);
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
                      (p.defaultData as BCMSPropEntryPointerData).templateId ===
                        templateId,
                  ),
              );
            },
            async findByCid(cid) {
              return await repo.findBy((e) => e.cid === cid);
            },
            async findAllByCid(cids) {
              return await repo.findAllBy((e) => cids.includes(e.cid));
            },
          };
        },
      });
    } else {
      groupRepo = createMongoDBCachedRepository<
        BCMSGroupMongoDB,
        BCMSGroupRepositoryMethods<BCMSGroupMongoDB>,
        undefined
      >({
        name,
        collection,
        schema: BCMSGroupMongoDBSchema,
        methods({ mongoDBInterface, cacheHandler }) {
          return {
            async findByName(nm) {
              const cacheHit = cacheHandler.findOne((e) => e.name === nm);
              if (cacheHit) {
                return cacheHit;
              }
              const group = await mongoDBInterface.findOne({ name: nm });
              if (group) {
                cacheHandler.set(group._id.toHexString(), group);
              }
              return group;
            },
            async findByCid(cid) {
              const cacheHit = cacheHandler.findOne((e) => e.cid === cid);
              if (cacheHit) {
                return cacheHit;
              }
              const group = await mongoDBInterface.findOne({ cid });
              if (group) {
                cacheHandler.set(group._id.toHexString(), group);
              }
              return group;
            },
            async findAllByCid(cids) {
              const missingCids: string[] = [];
              const output: BCMSGroupMongoDB[] = cacheHandler.find(e => {
                const found = cids.includes(e.cid);
                if (!found) {
                  missingCids.push(e.cid)
                }
                return found;
              });
              if (missingCids.length > 0) {
                const items = await mongoDBInterface.find({cid: {$in: missingCids}});
                for (let i = 0; i < items.length; i++) {
                  const item = items[i];
                  cacheHandler.set(item._id.toHexString(), item);
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
    }
  }

  return groupRepo;
}
