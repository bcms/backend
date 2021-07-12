import type { FSDBRepository } from '@becomes/purple-cheetah-mod-fsdb/types';
import type { MongoDBRepository } from '@becomes/purple-cheetah-mod-mongodb/types';
import type { BCMSIdCounterFSDB, BCMSIdCounterMongoDB } from './models';

export interface BCMSIdCounterRepositoryMethods<Entity> {
  findByForId(forId: string): Promise<Entity | null>;
  findAndIncByForId(forId: string): Promise<number | null>;
}

export type BCMSIdCounterRepository =
  | MongoDBRepository<
      BCMSIdCounterMongoDB,
      BCMSIdCounterRepositoryMethods<BCMSIdCounterMongoDB>
    >
  | FSDBRepository<
      BCMSIdCounterFSDB,
      BCMSIdCounterRepositoryMethods<BCMSIdCounterFSDB>
    >;
