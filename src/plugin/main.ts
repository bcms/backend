import * as path from 'path';
import {
  useFS,
  useObjectUtility,
  useStringUtility,
} from '@becomes/purple-cheetah';
import {
  Controller,
  FS,
  Middleware,
  Module,
  ObjectUtilityError,
  StringUtility,
} from '@becomes/purple-cheetah/types';
import { useBcmsShimService } from '../shim';
import {
  BCMSConfig,
  BCMSShimService,
  BCMSPlugin,
  BCMSPluginConfig,
  BCMSPluginConfigSchema,
  BCMSPluginManager,
} from '../types';

export function createBcmsPlugin(config: BCMSPluginConfig): BCMSPlugin {
  const objectUtil = useObjectUtility();
  const checkConfig = objectUtil.compareWithSchema(
    config,
    BCMSPluginConfigSchema,
    'config',
  );
  if (checkConfig instanceof ObjectUtilityError) {
    throw Error(checkConfig.message);
  }
  return {
    name: config.name,
    controllers: config.controllers ? config.controllers : [],
    middleware: config.middleware ? config.middleware : [],
  };
}

export function createBcmsPluginModule(bcmsConfig: BCMSConfig): Module {
  async function loadNext(data: {
    index: number;
    controllers: Controller[];
    middleware: Middleware[];
    addedPlugins: string[];
    stringUtil: StringUtility;
    shimService: BCMSShimService;
    fs: FS;
  }): Promise<{
    controllers: Controller[];
    middleware: Middleware[];
  }> {
    if (!bcmsConfig.plugins || !bcmsConfig.plugins[data.index]) {
      return {
        controllers: data.controllers,
        middleware: data.middleware,
      };
    }
    const localPluginPath = path.join(
      process.cwd(),
      'plugins',
      bcmsConfig.plugins[data.index],
      'backend',
    );
    const nodeModulePluginPath = path.join(
      process.cwd(),
      'node_modules',
      bcmsConfig.plugins[data.index],
      'backend',
    );
    let pluginPath = '';
    if (await data.fs.exist(localPluginPath)) {
      pluginPath = localPluginPath;
    } else if (await data.fs.exist(nodeModulePluginPath)) {
      pluginPath = nodeModulePluginPath;
    } else {
      throw Error(
        `Plugin with name "${bcmsConfig.plugins[data.index]}" does not exist.`,
      );
    }
    if (await data.fs.exist(path.join(pluginPath, 'main.ts'), true)) {
      pluginPath = path.join(pluginPath, 'main.ts');
    } else if (await data.fs.exist(path.join(pluginPath, 'main.js'), true)) {
      pluginPath = path.join(pluginPath, 'main.js');
    } else {
      throw Error(
        `Plugin with name "${
          bcmsConfig.plugins[data.index]
        }" does not contain "main.js" or "main.ts" file at path ${pluginPath}.`,
      );
    }
    const plugin: BCMSPlugin = await import(pluginPath);
    if (!plugin.name) {
      return {
        controllers: data.controllers,
        middleware: data.middleware,
      };
    }
    plugin.name = data.stringUtil.toSlug(plugin.name);
    if (data.addedPlugins.includes(plugin.name)) {
      throw Error(`Plugin with name "${plugin.name}" is duplicate.`);
    }
    data.addedPlugins.push(plugin.name);

    const verifyResult: { ok: boolean } = await data.shimService.send({
      uri: `/instance/plugin/verify/${plugin.name}`,
      payload: {},
    });

    if (!verifyResult.ok) {
      throw Error(`Plugin "${plugin.name}" is denied by the BCMS Cloud.`);
    }

    if (plugin.controllers) {
      for (let j = 0; j < plugin.controllers.length; j++) {
        const controller = plugin.controllers[j]();
        controller.path = `/api/plugin/${plugin.name}`;
        data.controllers.push(() => {
          return controller;
        });
      }
    }
    if (plugin.middleware) {
      for (let j = 0; j < plugin.middleware.length; j++) {
        const mid = plugin.middleware[j]();
        mid.path = `/api/plugin/${plugin.name}`;
        data.middleware.push(() => {
          return mid;
        });
      }
    }
    return loadNext({
      index: data.index + 1,
      controllers: data.controllers,
      middleware: data.middleware,
      addedPlugins: data.addedPlugins,
      shimService: data.shimService,
      stringUtil: data.stringUtil,
      fs: data.fs,
    });
  }

  return {
    name: 'Plugins',
    initialize(moduleConfig) {
      const addedPlugins: string[] = [];
      const stringUtil = useStringUtility();
      const shimService = useBcmsShimService();
      const fs = useFS();

      if (bcmsConfig.plugins) {
        loadNext({
          index: 0,
          controllers: [],
          middleware: [],
          addedPlugins,
          stringUtil,
          shimService,
          fs,
        })
          .then((result) => {
            pluginManager = {
              getList() {
                return addedPlugins;
              },
            };
            moduleConfig.next(undefined, {
              controllers: result.controllers,
              middleware: result.middleware,
            });
          })
          .catch((error) => {
            moduleConfig.next(error);
          });
      } else {
        moduleConfig.next();
      }
    },
  };
}

let pluginManager: BCMSPluginManager;

export function useBcmsPluginManager(): BCMSPluginManager {
  return pluginManager;
}
