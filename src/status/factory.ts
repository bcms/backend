import { BCMSConfig } from '@bcms/config';
import { Types } from 'mongoose';
import type { BCMSStatus, BCMSStatusFactory } from '../types';

export function createBcmsStatusFactory(): BCMSStatusFactory {
  return {
    create(data) {
      const status: BCMSStatus = {
        _id: new Types.ObjectId(),
        createdAt: Date.now(),
        updatedAt: Date.now(),
        color: data.color ? data.color : '',
        label: data.label ? data.label : '',
        name: data.name ? data.name : '',
      };
      if (BCMSConfig.database.fs) {
        status._id = status._id.toHexString() as never;
      }
      return status;
    },
  };
}
