import type { FSDBRepository } from '@becomes/purple-cheetah-mod-fsdb/types';
import type { MongoDBCachedRepository } from '@becomes/purple-cheetah-mod-mongodb/types';
import type { BCMSTemplateFSDB, BCMSTemplateMongoDB } from './models';

export interface BCMSTemplateRepositoryMethods<E> {
  findByName(name: string): Promise<E | null>;
}

export type BCMSTemplateRepository =
  | MongoDBCachedRepository<
      BCMSTemplateMongoDB,
      BCMSTemplateRepositoryMethods<BCMSTemplateMongoDB>
    >
  | FSDBRepository<
      BCMSTemplateFSDB,
      BCMSTemplateRepositoryMethods<BCMSTemplateFSDB>
    >;
