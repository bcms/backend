import type { FSDBRepository } from '@becomes/purple-cheetah-mod-fsdb/types';
import type { MongoDBCachedRepository } from '@becomes/purple-cheetah-mod-mongodb/types';
import type { BCMSTemplate } from './models';

export interface BCMSTemplateRepositoryMethods {
  findByName(name: string): Promise<BCMSTemplate | null>;
  findByCid(cid: string): Promise<BCMSTemplate | null>;
  findAllByCid(cids: string[]): Promise<BCMSTemplate[]>;
  findAllByPropGroupPointer(groupId: string): Promise<BCMSTemplate[]>;
  findAllByPropEntryPointer(templateId: string): Promise<BCMSTemplate[]>;
  findAllByPropTag(tagId: string): Promise<BCMSTemplate[]>;
}

export type BCMSTemplateRepository =
  | MongoDBCachedRepository<BCMSTemplate, BCMSTemplateRepositoryMethods>
  | FSDBRepository<BCMSTemplate, BCMSTemplateRepositoryMethods>;
