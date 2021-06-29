import { Types } from 'mongoose';
import { useBcmsConfig } from '../config';
import { BCMSMedia, BCMSMediaFactory, BCMSMediaType } from './types';

let mediaFactory: BCMSMediaFactory;

export function useBcmsMediaFactory(): BCMSMediaFactory {
  if (!mediaFactory) {
    const bcmsConfig = useBcmsConfig();

    mediaFactory = {
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
          path: data.path ? data.path : '',
          size: data.size ? data.size : 0,
          type: data.type ? data.type : BCMSMediaType.DIR,
          userId: data.userId ? data.userId : '',
        };
        if (bcmsConfig.database.fs) {
          media._id = media._id.toHexString() as never;
        }
        return media;
      },
    };
  }

  return mediaFactory;
}
