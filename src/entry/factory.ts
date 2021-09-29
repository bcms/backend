import { BCMSConfig } from '@bcms/config';
import { Types } from 'mongoose';
import type { BCMSEntry, BCMSEntryFactory } from '../types';

export function createBcmsEntryFactory(): BCMSEntryFactory {
  return {
    create(data) {
      const entry: BCMSEntry = {
        _id: new Types.ObjectId(),
        createdAt: Date.now(),
        updatedAt: Date.now(),
        cid: data.cid ? data.cid : '',
        templateId: data.templateId ? data.templateId : '',
        userId: data.userId ? data.userId : '',
        status: data.status ? data.status : '',
        meta: data.meta ? data.meta : [],
        content: data.content ? data.content : [],
      };
      if (BCMSConfig.database.fs) {
        entry._id = `${entry._id}` as never;
      }
      return entry;
    },
    toLite(entry) {
      return {
        _id: `${entry._id}`,
        createdAt: entry.createdAt,
        updatedAt: entry.updatedAt,
        cid: entry.cid,
        templateId: entry.templateId,
        userId: entry.userId,
        meta: entry.meta.map((meta) => {
          return {
            lng: meta.lng,
            props: meta.props.slice(0, 2),
          };
        }),
      };
    },
  };
}
