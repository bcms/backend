import type { BCMSColorFactory } from '@bcms/types';
import { v4 as uuidv4 } from 'uuid';
import { Types } from 'mongoose';

export function createBcmsColorFactory(): BCMSColorFactory {
  return {
    create(data) {
      return {
        _id: `${new Types.ObjectId()}`,
        createdAt: Date.now(),
        updatedAt: Date.now(),
        cid: data.cid ? data.cid : '',
        label: data.label ? data.label : '',
        name: data.name ? data.name : '',
        value: data.value ? data.value : '',
        userId: data.userId ? data.userId : '',
        source: data.source
          ? data.source
          : {
              id: uuidv4(),
              type: 'template',
            },
      };
    },
  };
}
