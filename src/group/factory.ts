import { Types } from 'mongoose';
import type { BCMSGroupFactory } from '../types';

export function createBcmsGroupFactory(): BCMSGroupFactory {
  return {
    create(config) {
      return {
        _id: `${new Types.ObjectId()}`,
        createdAt: Date.now(),
        updatedAt: Date.now(),
        cid: config.cid,
        desc: config.desc,
        label: config.label,
        name: config.name,
        props: [],
      };
    },
    toLite(group) {
      return {
        _id: group._id,
        createdAt: group.createdAt,
        updatedAt: group.updatedAt,
        cid: group.cid,
        desc: group.desc,
        name: group.name,
        label: group.label,
        propsCount: group.props.length,
      };
    },
  };
}
