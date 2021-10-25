import type { FSDBRepository } from '@becomes/purple-cheetah-mod-fsdb/types';
import type { MongoDBCachedRepository } from '@becomes/purple-cheetah-mod-mongodb/types';
import type { BCMSColor } from './models';

export interface BCMSColorRepositoryMethods {
  findByName(name: string): Promise<BCMSColor | null>;
}

export type BCMSColorRepository =
  | MongoDBCachedRepository<BCMSColor, BCMSColorRepositoryMethods>
  | FSDBRepository<BCMSColor, BCMSColorRepositoryMethods>;
