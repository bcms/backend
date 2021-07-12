import { Types } from 'mongoose';
import { useBcmsConfig } from '../config';
import type { BCMSIdCounter, BCMSIdCounterFactory } from './types';

let factory: BCMSIdCounterFactory;

export function useBcmsIdCounterFactory(): BCMSIdCounterFactory {
  if (!factory) {
    const bcmsConfig = useBcmsConfig();
    factory = {
      create(data) {
        const idCounter: BCMSIdCounter = {
          _id: new Types.ObjectId(),
          createdAt: Date.now(),
          updatedAt: Date.now(),
          count: data.count ? data.count : 1,
          name: data.name ? data.name : '',
          forId: data.forId ? data.forId : '',
        };

        if (bcmsConfig.database.fs) {
          idCounter._id = idCounter._id.toHexString() as never;
        }
        return idCounter;
      },
    };
  }

  return factory;
}
