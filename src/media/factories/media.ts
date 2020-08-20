import { Media, FSMedia, MediaType } from '../models';
import { Types } from 'mongoose';
import { MediaAggregate } from '../interfaces';

export class MediaFactory {
  static get instance(): Media | FSMedia {
    if (process.env.DB_USE_FS) {
      return new FSMedia(
        new Types.ObjectId().toHexString(),
        Date.now(),
        Date.now(),
        '',
        MediaType.DIR,
        '',
        0,
        '',
        '/',
        true,
        false,
        '',
      );
    } else {
      return new Media(
        new Types.ObjectId(),
        Date.now(),
        Date.now(),
        '',
        MediaType.DIR,
        '',
        0,
        '',
        '/',
        true,
        false,
        '',
      );
    }
  }

  static aggregateParent(
    parent: Media | FSMedia,
    allMedia: Array<Media | FSMedia>,
  ): MediaAggregate {
    const parentAggregate: MediaAggregate = {
      _id:
        typeof parent._id === 'string' ? parent._id : parent._id.toHexString(),
      createdAt: parent.createdAt,
      updatedAt: parent.updatedAt,
      isInRoot: parent.isInRoot,
      mimetype: parent.mimetype,
      name: parent.name,
      path: parent.path,
      size: parent.size,
      state: false,
      type: parent.type,
      userId: parent.userId,
    };
    if (parent.hasChildren) {
      parentAggregate.children = [];
      const childrenIndexes: number[] = [];
      // tslint:disable-next-line: prefer-for-of
      for (let i = 0; i < allMedia.length; i = i + 1) {
        if (
          allMedia[i].parentId ===
          (typeof parent._id === 'string'
            ? parent._id
            : parent._id.toHexString())
        ) {
          childrenIndexes.push(i);
        }
      }
      for (const i in childrenIndexes) {
        const child = allMedia[childrenIndexes[i]];
        if (child.hasChildren) {
          parentAggregate.children.push(this.aggregateParent(child, allMedia));
        } else {
          parentAggregate.children.push({
            _id:
              typeof child._id === 'string'
                ? child._id
                : child._id.toHexString(),
            createdAt: child.createdAt,
            updatedAt: child.updatedAt,
            isInRoot: child.isInRoot,
            mimetype: child.mimetype,
            name: child.name,
            path: child.path,
            size: child.size,
            state: false,
            type: child.type,
            userId: child.userId,
          });
        }
      }
    }
    return parentAggregate;
  }

  static aggregateFromRoot(media: Array<Media | FSMedia>): MediaAggregate[] {
    const aggregated: MediaAggregate[] = [];
    for (const i in media) {
      if (media[i].isInRoot) {
        aggregated.push(this.aggregateParent(media[i], media));
      }
    }
    return aggregated;
  }
}
