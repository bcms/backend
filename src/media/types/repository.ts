import type { FSDBRepository } from '@becomes/purple-cheetah-mod-fsdb/types';
import type { MongoDBCachedRepository } from '@becomes/purple-cheetah-mod-mongodb/types';
import type { BCMSMediaFSDB, BCMSMediaMongoDB } from './models';

export interface BCMSMediaRepositoryMethods<E> {
  findAllByIsInRoot(isInRoot: boolean): Promise<E[]>;
  findByNameAndParentId(name: string, parentId?: string): Promise<E | null>;
  findAllByParentId(parentId: string): Promise<E[]>;
}

export type BCMSMediaRepository =
  | MongoDBCachedRepository<
      BCMSMediaMongoDB,
      BCMSMediaRepositoryMethods<BCMSMediaMongoDB>
    >
  | FSDBRepository<BCMSMediaFSDB, BCMSMediaRepositoryMethods<BCMSMediaFSDB>>;
