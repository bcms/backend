import type { BCMSGroup, BCMSGroupFactory } from '../types';
import { Types } from 'mongoose';
import { useBcmsConfig } from '../config';

let bcmsGroupFactory: BCMSGroupFactory;

export function useBcmsGroupFactory() {
  if (bcmsGroupFactory) {
    return bcmsGroupFactory;
  }
  const bcmsConfig = useBcmsConfig();
  bcmsGroupFactory = {
    create() {
      const group: BCMSGroup = {
        _id: new Types.ObjectId(),
        createdAt: -1,
        updatedAt: -1,
        name: '',
        label: '',
        desc: '',
        props: [],
      };
      if (bcmsConfig.database.fs) {
        group._id = group._id.toHexString() as never;
      }
      return group;
    },
    toLite(group) {
      return {
        _id: `${group._id}`,
        createdAt: group.createdAt,
        updatedAt: group.updatedAt,
        desc: group.desc,
        name: group.name,
        label: group.label,
        propsCount: group.props.length,
      };
    },
  };
  return bcmsGroupFactory;
}
