import * as crypto from 'crypto';
import { Types } from 'mongoose';
import { useBcmsConfig } from '../config';
import { useBcmsFunctionManger } from '../function';
import type { BCMSApiKey, BCMSApiKeyFactory } from './types';

let apiKeyFactory: BCMSApiKeyFactory;

export function useBcmsApiKeyFactory(): BCMSApiKeyFactory {
  if (!apiKeyFactory) {
    const functionManager = useBcmsFunctionManger();
    const bcmsConfig = useBcmsConfig();
    apiKeyFactory = {
      create(data) {
        const apiKey: BCMSApiKey = {
          _id: new Types.ObjectId(),
          createdAt: Date.now(),
          updatedAt: Date.now(),
          access: data.access,
          blocked: data.blocked,
          desc: data.desc,
          name: data.name,
          secret: crypto.randomBytes(32).toString('hex'),
          userId: data.userId,
        };
        if (bcmsConfig.database.fs) {
          apiKey._id = apiKey._id.toHexString() as never;
        }
        return apiKey;
      },
      rewriteKey(key) {
        const k: BCMSApiKey = JSON.parse(JSON.stringify(key));
        let modified = false;
        const fns = functionManager.getAll();
        for (let i = 0; i < fns.length; i++) {
          const fn = fns[i];
          if (
            fn.config.public &&
            !k.access.functions.find((e) => e.name === fn.config.name)
          ) {
            modified = true;
            k.access.functions.push({ name: fn.config.name });
          }
        }
        const removeFunctions: string[] = [];
        for (let i = 0; i < k.access.functions.length; i++) {
          const keyFn = k.access.functions[i];
          if (!fns.find((fn) => fn.config.name === keyFn.name)) {
            removeFunctions.push(keyFn.name);
          }
        }
        if (removeFunctions.length > 0) {
          modified = true;
          k.access.functions = k.access.functions.filter(
            (e) => !removeFunctions.includes(e.name),
          );
        }
        // TODO: rewrite templates

        return {
          key: k,
          modified,
        };
      },
    };
  }
  return apiKeyFactory;
}