import { Media, FSMedia, MediaType } from '../models';
import { Types } from 'mongoose';

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
      );
    }
  }
}
