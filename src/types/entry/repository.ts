import type { FSDBRepository } from '@becomes/purple-cheetah-mod-fsdb/types';
import type { MongoDBCachedRepository } from '@becomes/purple-cheetah-mod-mongodb/types';
import type { BCMSEntryFSDB, BCMSEntryMongoDB } from './models';

export interface BCMSEntryRepositoryMethods<E> {
  findByTemplateIdAndCid(
    templateId: string,
    entryCid: string,
  ): Promise<E | null>;
  findAllByStatus(status: string): Promise<E[]>;
  findAllByTemplateId(templateId: string): Promise<E[]>;
  clearAllStatuses(currentStatus: string): Promise<void>;
  deleteAllByTemplateId(templateId: string): Promise<void>;
  countByTemplateId(templateId: string): Promise<number>;
}

export type BCMSEntryRepository =
  | MongoDBCachedRepository<
      BCMSEntryMongoDB,
      BCMSEntryRepositoryMethods<BCMSEntryMongoDB>
    >
  | FSDBRepository<BCMSEntryFSDB, BCMSEntryRepositoryMethods<BCMSEntryFSDB>>;
