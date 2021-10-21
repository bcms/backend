import type { FSDBRepository } from '@becomes/purple-cheetah-mod-fsdb/types';
import type { MongoDBCachedRepository } from '@becomes/purple-cheetah-mod-mongodb/types';
import type { BCMSTemplateOrganizer } from './models';

export interface BCMSTemplateOrganizerRepositoryMethods {
  findAllByParentId(parentId: string): Promise<BCMSTemplateOrganizer[]>;
  findByName(name: string): Promise<BCMSTemplateOrganizer | null>;
  findByTemplateId(templateId: string): Promise<BCMSTemplateOrganizer | null>;
}

export type BCMSTemplateOrganizerRepository =
  | MongoDBCachedRepository<
      BCMSTemplateOrganizer,
      BCMSTemplateOrganizerRepositoryMethods
    >
  | FSDBRepository<
      BCMSTemplateOrganizer,
      BCMSTemplateOrganizerRepositoryMethods
    >;
