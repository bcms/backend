import * as path from 'path';
import { Module, ObjectUtilityError } from '@becomes/purple-cheetah/types';
import {
  useFS,
  useObjectUtility,
  useStringUtility,
} from '@becomes/purple-cheetah';
import {
  BCMSFunction,
  BCMSFunctionManager,
  BCMSFunctionSchema,
} from '../types';

let functionManager: BCMSFunctionManager;

export function createBcmsFunctionModule(): Module {
  return {
    name: 'Function',
    initialize(moduleConfig) {
      let fns: BCMSFunction<unknown>[] = [];
      const fs = useFS();
      const objectUtil = useObjectUtility();
      const stringUtil = useStringUtility();
      const fnsPath = path.join(process.cwd(), 'functions');
      fs.exist(fnsPath)
        .then(async (result) => {
          if (result) {
            const fnNames = await fs.readdir(fnsPath);
            for (let i = 0; i < fnNames.length; i++) {
              const fnName = fnNames[i];
              if (fnName.endsWith('.js') || fnName.endsWith('.ts')) {
                const fnImport: { default: () => Promise<BCMSFunction<unknown>> } =
                  await import(path.join(fnsPath, fnName));
                const checkFn = objectUtil.compareWithSchema(
                  { fn: fnImport.default },
                  {
                    fn: {
                      __type: 'function',
                      __required: true,
                    },
                  },
                  fnName,
                );
                if (checkFn instanceof ObjectUtilityError) {
                  moduleConfig.next(Error(checkFn.message));
                  return;
                }
                const fn = await fnImport.default();
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
                  return;
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
          }
          moduleConfig.next();
        })
        .catch((error) => {
          moduleConfig.next(error);
        });
    },
  };
}

export function useBcmsFunctionManger(): BCMSFunctionManager {
  return functionManager;
}
