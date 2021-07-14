import type { FSDBRepository } from '@becomes/purple-cheetah-mod-fsdb/types';
import type { MongoDBCachedRepository } from '@becomes/purple-cheetah-mod-mongodb/types';
import type { BCMSWidgetFSDB, BCMSWidgetMongoDB } from './models';

export interface BCMSWidgetRepositoryMethods<E> {
  findByName(name: string): Promise<E | null>;
  findAllByPropGroupPointer(groupId: string): Promise<E[]>;
  findAllByPropEntryPointer(templateId: string): Promise<E[]>;
}

export type BCMSWidgetRepository =
  | MongoDBCachedRepository<
      BCMSWidgetMongoDB,
      BCMSWidgetRepositoryMethods<BCMSWidgetMongoDB>
    >
  | FSDBRepository<BCMSWidgetFSDB, BCMSWidgetRepositoryMethods<BCMSWidgetFSDB>>;
