import {
  JWTConfigService,
  JWTEncryptionAlg,
  FSDBManager,
} from '@becomes/purple-cheetah';
import { ResponseCode } from './response-code';
import { CacheControl } from './cache';
import { FunctionManager } from './function';
import { EventManager } from './event';
import { JobManager } from './job';

export class Config {
  public static async init() {
    await ResponseCode.init();
    JWTConfigService.add({
      id: 'user-token-config',
      alg: JWTEncryptionAlg.HMACSHA256,
      expIn: parseInt(process.env.JWT_EXP_AFTER, 10),
      issuer: process.env.JWT_ISSUER,
      secret: process.env.JWT_SECRET,
    });
    if (process.env.DB_USE_FS === 'true') {
      await FSDBManager.init(process.cwd());
    }
    CacheControl.init();
    await FunctionManager.init();
    await EventManager.init();
    await JobManager.init();
  }
}
