import { Group, FSGroup } from '../models';
import { Types } from 'mongoose';

export class GroupFactory {
  static instance(): Group | FSGroup {
    if (process.env.DB_USE_FS === 'true') {
      return new FSGroup(
        new Types.ObjectId().toHexString(),
        Date.now(),
        Date.now(),
        '',
        '',
        [],
      );
    } else {
      return new Group(
        new Types.ObjectId(),
        Date.now(),
        Date.now(),
        '',
        '',
        [],
      );
    }
  }
}
