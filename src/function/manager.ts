import * as path from 'path';
import { Module, ObjectUtilityError } from '@becomes/purple-cheetah/types';
import {
  useFS,
  useObjectUtility,
  useStringUtility,
} from '@becomes/purple-cheetah';
import { BCMSFunction, BCMSFunctionManager, BCMSFunctionSchema } from './types';

let functionManager: BCMSFunctionManager;

export function createBcmsFunctionManager(): Module {
  return {
    name: 'Function manager',
    initialize(moduleConfig) {
      let fns: BCMSFunction<unknown>[] = [];
      const fs = useFS();
      const objectUtil = useObjectUtility();
      const stringUtil = useStringUtility();
      const fnsPath = path.join(process.cwd(), 'functions');
      if (fs.exist(fnsPath)) {
        fs.readdir(fnsPath)
          .then(async (fnNames) => {
            for (let i = 0; i < fnNames.length; i++) {
              const fnName = fnNames[i];
              if (fnName.endsWith('.js') || fnName.endsWith('.ts')) {
                const fn: BCMSFunction<unknown> = await import(
                  path.join(fnsPath, fnName)
                );
                const checkObject = objectUtil.compareWithSchema(
                  fn,
                  BCMSFunctionSchema,
                  fnName,
                );
                if (checkObject instanceof ObjectUtilityError) {
                  moduleConfig.next(Error(checkObject.message));
                  return;
                }
                fn.config.name = stringUtil.toSlug(fn.config.name);
                if (fns.find((e) => e.config.name === fn.config.name)) {
                  moduleConfig.next(
                    Error(
                      `Duplicate of "${fn.config.name}" function.` +
                        ' This is not allowed.',
                    ),
                  );
                }
                fns.push(fn);
              }
            }
            functionManager = {
              clear() {
                fns = [];
              },
              get(name) {
                return fns.find((e) => e.config.name === name);
              },
              getAll() {
                return fns;
              },
            };
            moduleConfig.next();
          })
          .catch((error) => {
            moduleConfig.next(error);
          });
      }
    },
  };
}

export function useBcmsFunctionManger(): BCMSFunctionManager {
  return functionManager;
}
