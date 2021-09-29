import { BCMSConfig } from '@bcms/config';
import { Types } from 'mongoose';
import { BCMSMedia, BCMSMediaFactory, BCMSMediaType } from '../types';

export function createBcmsMediaFactory(): BCMSMediaFactory {
  return {
    create(data) {
      const media: BCMSMedia = {
        _id: new Types.ObjectId(),
        createdAt: Date.now(),
        updatedAt: Date.now(),
        hasChildren: data.hasChildren ? data.hasChildren : false,
        isInRoot: data.isInRoot ? data.isInRoot : false,
        mimetype: data.mimetype ? data.mimetype : '',
        name: data.name ? data.name : '',
        parentId: data.parentId ? data.parentId : '',
        size: data.size ? data.size : 0,
        type: data.type ? data.type : BCMSMediaType.DIR,
        userId: data.userId ? data.userId : '',
      };
      if (BCMSConfig.database.fs) {
        media._id = `${media._id}` as never;
      }
      return media;
    },
  };
}
