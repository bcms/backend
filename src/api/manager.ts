import { CacheControl } from '../cache';
import { FunctionManager } from '../function';
import { ApiKey, FSApiKey } from './models';

export class ApiKeyManager {
  static async initializeKeys(): Promise<void> {
    setTimeout(async () => {
      const keys: Array<FSApiKey | ApiKey> = JSON.parse(
        JSON.stringify(await CacheControl.apiKey.findAll()),
      );
      const updateKeys: Array<FSApiKey | ApiKey> = [];
      keys.forEach((key) => {
        const rewriteResult = this.rewriteKey(key);
        if (rewriteResult.modified) {
          updateKeys.push(rewriteResult.key);
        }
      });
      if (updateKeys.length > 0) {
        for (const i in updateKeys) {
          const key = updateKeys[i];
          await CacheControl.apiKey.update(key);
        }
      }
    }, 5000);
  }

  static rewriteKey(_key: FSApiKey | ApiKey) {
    const key: FSApiKey | ApiKey = JSON.parse(JSON.stringify(_key));
    let modified = false;
    const fns = FunctionManager.getAll();
    fns.forEach((fn) => {
      if (
        fn.config.public &&
        !key.access.functions.find((e) => e.name === fn.config.name)
      ) {
        modified = true;
        key.access.functions.push({ name: fn.config.name });
      }
    });
    const removeFunctions: string[] = [];
    key.access.functions.forEach((e) => {
      if (!fns.find((fn) => fn.config.name === e.name)) {
        removeFunctions.push(e.name);
      }
    });
    key.access.functions = key.access.functions.filter((e) => {
      modified = true;
      return !removeFunctions.find((fn) => fn === e.name);
    });
    return {
      modified,
      key,
    };
  }
}
