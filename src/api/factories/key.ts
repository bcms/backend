import * as crypto from 'crypto';
import { ApiKey, FSApiKey, ApiKeyAccess } from '../models';
import { Types } from 'mongoose';

export class ApiKeyFactory {
  static instance(
    userId: string,
    name: string,
    desc: string,
    blocked: boolean,
    access: ApiKeyAccess,
  ): ApiKey | FSApiKey {
    if (process.env.DB_USE_FS === 'true') {
      return new FSApiKey(
        new Types.ObjectId().toHexString(),
        Date.now(),
        Date.now(),
        userId,
        name,
        desc,
        blocked,
        crypto.randomBytes(32).toString('hex'),
        access,
      );
    } else {
      return new ApiKey(
        new Types.ObjectId(),
        Date.now(),
        Date.now(),
        userId,
        name,
        desc,
        blocked,
        crypto.randomBytes(32).toString('hex'),
        access,
      );
    }
  }
}
