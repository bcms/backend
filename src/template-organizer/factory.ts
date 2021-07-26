import { Types } from 'mongoose';
import { useBcmsConfig } from '../config';
import type {
  BCMSTemplateOrganizer,
  BCMSTemplateOrganizerFactory,
} from '../types';

let factory: BCMSTemplateOrganizerFactory;

export function useBcmsTemplateOrganizerFactory(): BCMSTemplateOrganizerFactory {
  if (!factory) {
    const bcmsConfig = useBcmsConfig();
    factory = {
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
        if (bcmsConfig.database.fs) {
          output._id = output._id.toHexString() as never;
        }
        return output;
      },
    };
  }
  return factory;
}
