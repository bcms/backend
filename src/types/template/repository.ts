import type { FSDBRepository } from '@becomes/purple-cheetah-mod-fsdb/types';
import type { MongoDBCachedRepository } from '@becomes/purple-cheetah-mod-mongodb/types';
import type { BCMSTemplateFSDB, BCMSTemplateMongoDB } from './models';

export interface BCMSTemplateRepositoryMethods<E> {
  findByName(name: string): Promise<E | null>;
  findByCid(cid: string): Promise<E | null>;
  findAllByCid(cids: string[]): Promise<E[]>;
  findAllByPropGroupPointer(groupId: string): Promise<E[]>;
  findAllByPropEntryPointer(templateId: string): Promise<E[]>;
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
