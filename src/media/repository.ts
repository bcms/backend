import { createFSDBRepository } from '@becomes/purple-cheetah-mod-fsdb';
import { createMongoDBCachedRepository } from '@becomes/purple-cheetah-mod-mongodb';
import { useBcmsConfig } from '../config';
import {
  BCMSMediaFSDB,
  BCMSMediaFSDBSchema,
  BCMSMediaMongoDB,
  BCMSMediaMongoDBSchema,
  BCMSMediaRepository,
  BCMSMediaRepositoryMethods,
} from '../types';

let mediaRepo: BCMSMediaRepository;

export function useBcmsMediaRepository(): BCMSMediaRepository {
  if (!mediaRepo) {
    const bcmsConfig = useBcmsConfig();
    const name = 'Media repository';
    const collection = `${bcmsConfig.database.prefix}_medias`;
    if (bcmsConfig.database.fs) {
      mediaRepo = createFSDBRepository<
        BCMSMediaFSDB,
        BCMSMediaRepositoryMethods<BCMSMediaFSDB>
      >({
        name,
        collection,
        schema: BCMSMediaFSDBSchema,
        methods({ repo }) {
          return {
            async findAllByIsInRoot(isInRoot) {
              return await repo.findAllBy((e) => e.isInRoot === isInRoot);
            },
            async findByNameAndParentId(nm, parentId) {
              if (!parentId) {
                return await repo.findBy(
                  (e) => e.name === nm && e.isInRoot === true,
                );
              } else {
                return await repo.findBy(
                  (e) => e.name === nm && e.parentId === parentId,
                );
              }
            },
            async findAllByParentId(parentId) {
              return await repo.findAllBy((e) => e.parentId === parentId);
            },
          };
        },
      });
    } else {
      mediaRepo = createMongoDBCachedRepository<
        BCMSMediaMongoDB,
        BCMSMediaRepositoryMethods<BCMSMediaMongoDB>,
        undefined
      >({
        name,
        collection,
        schema: BCMSMediaMongoDBSchema,
        methods({ mongoDBInterface, cacheHandler }) {
          const latches: {
            isInRoot: boolean;
            path: {
              [p: string]: boolean;
            };
            parent: {
              [id: string]: boolean;
            };
          } = {
            isInRoot: false,
            path: {},
            parent: {},
          };
          return {
            async findAllByIsInRoot(isInRoot) {
              if (latches.isInRoot) {
                return cacheHandler.find((e) => e.isInRoot === isInRoot);
              }
              const media = await mongoDBInterface.find({ isInRoot });
              media.forEach((m) => {
                cacheHandler.set(m._id.toHexString(), m);
              });
              latches.isInRoot = true;
              return media;
            },
            async findByNameAndParentId(nm, parentId) {
              if (parentId) {
                const cacheHit = cacheHandler.findOne(
                  (e) => e.parentId === parentId && e.name === nm,
                );
                if (cacheHit) {
                  return cacheHit;
                }
                const media = await mongoDBInterface.findOne({
                  parentId,
                  name: nm,
                });
                if (media) {
                  cacheHandler.set(media._id.toHexString(), media);
                }
                return media;
              } else {
                const cacheHit = cacheHandler.findOne(
                  (e) => e.isInRoot === true && e.name === nm,
                );
                if (cacheHit) {
                  return cacheHit;
                }
                const media = await mongoDBInterface.findOne({
                  isInRoot: true,
                  name: nm,
                });
                if (media) {
                  cacheHandler.set(media._id.toHexString(), media);
                }
                return media;
              }
            },
            async findAllByParentId(parentId) {
              if (latches.parent[parentId]) {
                return cacheHandler.find((e) => e.parentId === parentId);
              }
              const media = await mongoDBInterface.find({ parentId });
              media.forEach((m) => {
                cacheHandler.set(m._id.toHexString(), m);
              });
              latches.parent[parentId] = true;
              return media;
            },
          };
        },
      });
    }
  }
  return mediaRepo;
}
