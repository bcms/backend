import * as path from 'path';
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
    const configFile: ConfigFile = await import(
      path.join(process.cwd(), 'bcms.config.js')
    );
    if (configFile) {
      process.env.API_PORT = `${configFile.port}`;

      process.env.JWT_EXP_AFTER = '' + configFile.security.jwt.expireIn;
      process.env.JWT_ISSUER = '' + configFile.security.jwt.issuer;
      process.env.JWT_SECRET = '' + configFile.security.jwt.secret;

      if (configFile.database.fs) {
        process.env.DB_USE_FS = 'true';
        process.env.DB_PRFX = configFile.database.fs;
      } else {
        if (configFile.database.mongodb.atlas) {
          process.env.DB_NAME = configFile.database.mongodb.atlas.name;
          process.env.DB_USER = configFile.database.mongodb.atlas.user;
          process.env.DB_PASS = configFile.database.mongodb.atlas.password;
          process.env.DB_PRFX = configFile.database.mongodb.atlas.prefix;
          process.env.DB_CLUSTER = configFile.database.mongodb.atlas.cluster;
        } else {
          process.env.DB_HOST = configFile.database.mongodb.selfHosted.host;
          process.env.DB_PORT =
            '' + configFile.database.mongodb.selfHosted.port;
          process.env.DB_NAME = configFile.database.mongodb.selfHosted.name;
          process.env.DB_USER = configFile.database.mongodb.selfHosted.user;
          process.env.DB_PASS = configFile.database.mongodb.selfHosted.password;
          process.env.DB_PRFX = configFile.database.mongodb.selfHosted.prefix;
        }
      }
      if (configFile.plugins && configFile.plugins.length > 0) {
        process.env.BCMS_PLUGINS = configFile.plugins.join(',');
      }
    }
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
