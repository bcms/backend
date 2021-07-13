import { Types } from 'mongoose';
import { useBcmsConfig } from '../config';
import type { BCMSStatus, BCMSStatusFactory } from '../types';

let statusFactory: BCMSStatusFactory;

export function useBcmsStatusFactory(): BCMSStatusFactory {
  if (!statusFactory) {
    const bcmsConfig = useBcmsConfig();

    statusFactory = {
      create(data) {
        const status: BCMSStatus = {
          _id: new Types.ObjectId(),
          createdAt: Date.now(),
          updatedAt: Date.now(),
          color: data.color ? data.color : '',
          label: data.label ? data.label : '',
          name: data.name ? data.name : '',
        };
        if (bcmsConfig.database.fs) {
          status._id = status._id.toHexString() as never;
        }
        return status;
      },
    };
  }
  return statusFactory;
}
