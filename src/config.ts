import * as path from 'path';
import { useObjectUtility } from '@becomes/purple-cheetah';
import { ObjectUtilityError } from '@becomes/purple-cheetah/types';
import { BCMSConfig as BCMSConfigType, BCMSConfigSchema } from './types';

export const BCMSConfig: BCMSConfigType = {
  port: 1280,
  jwt: {
    expireIn: 300000,
    secret: 'secret',
    scope: 'localhost',
  },
  database: {
    prefix: 'bcms',
    fs: true,
  },
};

export function createBcmsConfig(config: BCMSConfigType): BCMSConfigType {
  return config;
}

export async function loadBcmsConfig(): Promise<void> {
  const configFile = await import(path.join(process.cwd(), 'bcms.config.js'));
  const objectUtil = useObjectUtility();
  const checkSchema = objectUtil.compareWithSchema(
    configFile,
    BCMSConfigSchema,
    'configFile',
  );
  if (checkSchema instanceof ObjectUtilityError) {
    throw Error(checkSchema.errorCode + ' ---> ' + checkSchema.message);
  }
  BCMSConfig.local = configFile.local;
  BCMSConfig.port = configFile.port;
  BCMSConfig.jwt = configFile.jwt;
  BCMSConfig.database = configFile.database;
  BCMSConfig.bodySizeLimit = configFile.bodySizeLimit;
  BCMSConfig.plugins = configFile.plugins;
}
