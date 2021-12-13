import type { BCMSChangeFactory } from '@bcms/types';
import { Types } from 'mongoose';

export function createBcmsChangeFactory(): BCMSChangeFactory {
  return {
    create(data) {
      return {
        _id: `${new Types.ObjectId()}`,
        createdAt: Date.now(),
        updatedAt: Date.now(),
        entry: data.entry ? data.entry : 0,
        group: data.group ? data.group : 0,
        color: data.color ? data.color : 0,
        language: data.language ? data.language : 0,
        media: data.media ? data.media : 0,
        status: data.status ? data.status : 0,
        tag: data.tag ? data.tag : 0,
        templates: data.templates ? data.templates : 0,
        widget: data.widget ? data.widget : 0,
      };
    },
  };
}
