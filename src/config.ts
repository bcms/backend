import * as path from 'path';
import { useObjectUtility } from '@becomes/purple-cheetah';
import { ObjectUtilityError } from '@becomes/purple-cheetah/types';
import { BCMSConfig, BCMSConfigSchema } from './types';

const bcmsConfig: BCMSConfig = {
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

export function createBcmsConfig(config: BCMSConfig): BCMSConfig {
  return config;
}

export function useBcmsConfig(): BCMSConfig {
  return { ...bcmsConfig };
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
  bcmsConfig.port = configFile.port;
  bcmsConfig.jwt = configFile.jwt;
  bcmsConfig.database = configFile.database;
  bcmsConfig.bodySizeLimit = configFile.bodySizeLimit;
  bcmsConfig.plugins = configFile.plugins;
}
