import { Group, FSGroup } from '../models';
import { Types } from 'mongoose';
import { GroupLite } from '../interfaces';
import { ObjectPropSchema } from '@becomes/purple-cheetah';

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
        {},
      );
    } else {
      return new Group(
        new Types.ObjectId(),
        Date.now(),
        Date.now(),
        '',
        '',
        [],
        {},
      );
    }
  }
  static toLite(group: Group | FSGroup): GroupLite {
    return {
      _id: typeof group._id === 'string' ? group._id : group._id.toHexString(),
      createdAt: group.createdAt,
      updatedAt: group.updatedAt,
      desc: group.desc,
      name: group.name,
      propsCount: group.props.length,
    };
  }
}
