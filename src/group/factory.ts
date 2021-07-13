import { Types } from 'mongoose';
import { useBcmsConfig } from '../config';
import type { BCMSGroup, BCMSGroupFactory } from '../types';

let groupFactory: BCMSGroupFactory;

export function useBcmsGroupFactory(): BCMSGroupFactory {
  if (!groupFactory) {
    const bcmsConfig = useBcmsConfig();
    groupFactory = {
      create(config) {
        const group: BCMSGroup = {
          _id: new Types.ObjectId(),
          createdAt: Date.now(),
          updatedAt: Date.now(),
          cid: config.cid,
          desc: config.desc,
          label: config.label,
          name: config.name,
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
          cid: group.cid,
          desc: group.desc,
          name: group.name,
          label: group.label,
          propsCount: group.props.length,
        };
      },
    };
  }
  return groupFactory;
}
