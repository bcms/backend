import type { FSDBRepository } from '@becomes/purple-cheetah-mod-fsdb/types';
import type { MongoDBCachedRepository } from '@becomes/purple-cheetah-mod-mongodb/types';
import type { BCMSStatusFSDB, BCMSStatusMongoDB } from './models';

export interface BCMSStatusRepositoryMethods<E> {
  findByName(name: string): Promise<E | null>;
}

export type BCMSStatusRepository =
  | MongoDBCachedRepository<
      BCMSStatusMongoDB,
      BCMSStatusRepositoryMethods<BCMSStatusMongoDB>
    >
  | FSDBRepository<BCMSStatusFSDB, BCMSStatusRepositoryMethods<BCMSStatusFSDB>>;
