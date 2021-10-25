import type { FSDBRepository } from '@becomes/purple-cheetah-mod-fsdb/types';
import type { MongoDBCachedRepository } from '@becomes/purple-cheetah-mod-mongodb/types';
import type { BCMSGroup } from './models';

export interface BCMSGroupRepositoryMethods {
  findByName(name: string): Promise<BCMSGroup | null>;
  findByCid(cid: string): Promise<BCMSGroup | null>;
  findAllByCid(cids: string[]): Promise<BCMSGroup[]>;
  findAllByPropGroupPointer(groupId: string): Promise<BCMSGroup[]>;
  findAllByPropEntryPointer(templateId: string): Promise<BCMSGroup[]>;
}

export type BCMSGroupRepository =
  | MongoDBCachedRepository<BCMSGroup, BCMSGroupRepositoryMethods>
  | FSDBRepository<BCMSGroup, BCMSGroupRepositoryMethods>;
