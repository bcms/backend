import type { FSDBRepository } from '@becomes/purple-cheetah-mod-fsdb/types';
import type { MongoDBCachedRepository } from '@becomes/purple-cheetah-mod-mongodb/types';
import type {
  BCMSTemplateOrganizerFSDB,
  BCMSTemplateOrganizerMongoDB,
} from './models';

export interface BCMSTemplateOrganizerRepositoryMethods<E> {
  findAllByParentId(parentId: string): Promise<E[]>;
  findByName(name: string): Promise<E | null>;
  findByTemplateId(templateId: string): Promise<E | null>;
}

export type BCMSTemplateOrganizerRepository =
  | MongoDBCachedRepository<
      BCMSTemplateOrganizerMongoDB,
      BCMSTemplateOrganizerRepositoryMethods<BCMSTemplateOrganizerMongoDB>
    >
  | FSDBRepository<
      BCMSTemplateOrganizerFSDB,
      BCMSTemplateOrganizerRepositoryMethods<BCMSTemplateOrganizerFSDB>
    >;
