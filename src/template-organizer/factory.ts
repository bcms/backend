import { BCMSConfig } from '@bcms/config';
import { Types } from 'mongoose';
import type {
  BCMSTemplateOrganizer,
  BCMSTemplateOrganizerFactory,
} from '../types';

export function createBcmsTemplateOrganizerFactory(): BCMSTemplateOrganizerFactory {
  return {
    create(data) {
      const output: BCMSTemplateOrganizer = {
        _id: new Types.ObjectId(),
        createdAt: Date.now(),
        updatedAt: Date.now(),
        label: data.label ? data.label : '',
        name: data.name ? data.name : '',
        templateIds: data.templateIds ? data.templateIds : [],
        parentId: data.parentId,
      };
      if (BCMSConfig.database.fs) {
        output._id = `${output._id}` as never;
      }
      return output;
    },
  };
}
