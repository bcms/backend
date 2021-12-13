import type { FSDBRepository } from '@becomes/purple-cheetah-mod-fsdb/types';
import type { MongoDBCachedRepository } from '@becomes/purple-cheetah-mod-mongodb/types';
import type { BCMSChange } from './models';

export interface BCMSChangeRepositoryMethods {
  showAll(): Promise<BCMSChange> | null;
}

export type BCMSChangeRepository =
  | MongoDBCachedRepository<BCMSChange, BCMSChangeRepositoryMethods>
  | FSDBRepository<BCMSChange, BCMSChangeRepositoryMethods>;
