import { BCMSConfig } from '@bcms/config';
import { Types } from 'mongoose';
import type { BCMSIdCounter, BCMSIdCounterFactory } from '../types';

export function createBcmsIdCounterFactory(): BCMSIdCounterFactory {
  return {
    create(data) {
      const idCounter: BCMSIdCounter = {
        _id: new Types.ObjectId(),
        createdAt: Date.now(),
        updatedAt: Date.now(),
        count: data.count ? data.count : 1,
        name: data.name ? data.name : '',
        forId: data.forId ? data.forId : '',
      };

      if (BCMSConfig.database.fs) {
        idCounter._id = idCounter._id.toHexString() as never;
      }
      return idCounter;
    },
  };
}
