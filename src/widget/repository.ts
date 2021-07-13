import { createFSDBRepository } from '@becomes/purple-cheetah-mod-fsdb';
import { createMongoDBCachedRepository } from '@becomes/purple-cheetah-mod-mongodb';
import { useBcmsConfig } from '../config';
import {
  BCMSWidgetFSDB,
  BCMSWidgetFSDBSchema,
  BCMSWidgetMongoDB,
  BCMSWidgetMongoDBSchema,
  BCMSWidgetRepository,
  BCMSWidgetRepositoryMethods,
} from '../types';

let widgetRepo: BCMSWidgetRepository;

export function useBcmsWidgetRepository(): BCMSWidgetRepository {
  if (!widgetRepo) {
    const bcmsConfig = useBcmsConfig();
    const nm = 'Widget repository';
    const collection = `${bcmsConfig.database.prefix}_widgets`;
    if (bcmsConfig.database.fs) {
      widgetRepo = createFSDBRepository<
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
          };
        },
      });
    } else {
      widgetRepo = createMongoDBCachedRepository<
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
                cacheHandler.set(widget._id.toHexString(), widget);
              }
              return widget;
            },
          };
        },
      });
    }
  }

  return widgetRepo;
}
