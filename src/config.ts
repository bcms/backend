import {
  JWTConfigService,
  JWTEncryptionAlg,
  FSDBManager,
} from '@becomes/purple-cheetah';
import { ResponseCode } from './response-code';
import { CacheControl, CacheWriteBuffer } from './cache';
import { FunctionManager } from './function';
import { EventManager } from './event';
import { JobManager } from './job';
import { PluginManager } from './plugin';

export interface ConfigFile {
  port: number;
  security: {
    jwt: {
      issuer: string;
      secret: string;
      expireIn: number;
    };
  };
  database: {
    fs?: string;
    mongodb?: {
      selfHosted?: {
        host: string;
        port: number;
        name: string;
        user: string;
        password: string;
        prefix: string;
      };
      atlas?: {
        name: string;
        user: string;
        password: string;
        prefix: string;
        cluster: string;
      };
    };
  };
  plugins: string[];
}

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
      await FSDBManager.init(process.cwd(), 'bcms.db.json');
    }
    CacheWriteBuffer.init();
    CacheControl.init();
    await FunctionManager.init();
    await EventManager.init();
    await JobManager.init();
    if (process.env.BCMS_PLUGINS) {
      const plugins = process.env.BCMS_PLUGINS.split(',');
      await PluginManager.load(plugins);
    }
  }
}
