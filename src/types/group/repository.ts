import type { FSDBRepository } from '@becomes/purple-cheetah-mod-fsdb/types';
import type { MongoDBCachedRepository } from '@becomes/purple-cheetah-mod-mongodb/types';
import type { BCMSGroupFSDB, BCMSGroupMongoDB } from './models';

export interface BCMSGroupRepositoryMethods<E> {
  findByName(name: string): Promise<E | null>;
  findAllByPropGroupPointer(groupId: string): Promise<E[]>;
  findAllByPropEntryPointer(templateId: string): Promise<E[]>;
}

export type BCMSGroupRepository =
  | MongoDBCachedRepository<
      BCMSGroupMongoDB,
      BCMSGroupRepositoryMethods<BCMSGroupMongoDB>
    >
  | FSDBRepository<BCMSGroupFSDB, BCMSGroupRepositoryMethods<BCMSGroupFSDB>>;
