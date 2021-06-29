import { Types } from 'mongoose';
import { FSStatus, Status } from './models';

export class StatusFactory {
  static get instance(): Status | FSStatus {
    if (process.env.DB_USE_FS === 'true') {
      return new FSStatus(
        Types.ObjectId().toHexString(),
        Date.now(),
        Date.now(),
        '',
        '',
        '',
      );
    } else {
      return new Status(Types.ObjectId(), Date.now(), Date.now(), '', '', '');
    }
  }
}
