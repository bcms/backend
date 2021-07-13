import type { FSDBRepository } from '@becomes/purple-cheetah-mod-fsdb/types';
import type { MongoDBCachedRepository } from '@becomes/purple-cheetah-mod-mongodb/types';
import type { BCMSLanguageFSDB, BCMSLanguageMongoDB } from './models';

export interface BCMSLanguageRepositoryMethods<E> {
  findByCode(code: string): Promise<E | null>;
  findByDefault(): Promise<E | null>;
}

export type BCMSLanguageRepository =
  | MongoDBCachedRepository<
      BCMSLanguageMongoDB,
      BCMSLanguageRepositoryMethods<BCMSLanguageMongoDB>
    >
  | FSDBRepository<
      BCMSLanguageFSDB,
      BCMSLanguageRepositoryMethods<BCMSLanguageFSDB>
    >;
