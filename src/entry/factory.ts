import { Entry, FSEntry } from './models';
import { Types } from 'mongoose';
import { EntryLite } from './interfaces';

export class EntryFactory {
  static get instance(): Entry | FSEntry {
    if (process.env.DB_USE_FS === 'true') {
      return new FSEntry(
        new Types.ObjectId().toHexString(),
        Date.now(),
        Date.now(),
        '',
        '',
        [],
        [],
        '',
      );
    } else {
      return new Entry(
        new Types.ObjectId(),
        Date.now(),
        Date.now(),
        '',
        '',
        [],
        [],
        '',
      );
    }
  }

  static toLite(entry: Entry | FSEntry): EntryLite {
    return {
      _id: typeof entry._id === 'string' ? entry._id : entry._id.toHexString(),
      createdAt: entry.createdAt,
      updatedAt: entry.updatedAt,
      templateId: entry.templateId,
      userId: entry.userId,
      meta: entry.meta.map(meta => {
        return {
          lng: meta.lng,
          props: meta.props.slice(0, 2),
        };
      }),
    };
  }
}
