import * as fileSystem from 'fs';
import * as path from 'path';
import * as util from 'util';
import {
  useFS,
  useLogger,
  useObjectUtility,
  useStringUtility,
} from '@becomes/purple-cheetah';
import {
  Controller,
  FS,
  Logger,
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
  BCMSPluginInfo,
} from '../types';
import { useBcmsChildProcess, bcmsGetDirFileTree } from '@bcms/util';

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
  async function injectPaths(fs: FS, location: string) {
    const filesData = await bcmsGetDirFileTree(location, '');
    for (let i = 0; i < filesData.length; i++) {
      const fileData = filesData[i];
      if (fileData.abs.endsWith('.js') || fileData.abs.endsWith('.ts')) {
        let file = (await fs.read(fileData.abs)).toString();
        file = file.replace(
          '@becomes/cms-backend',
          path.join(process.cwd(), 'src'),
        );
        await util.promisify(fileSystem.writeFile)(fileData.abs, file);
      }
    }
  }
  async function loadNext(data: {
    index: number;
    controllers: Controller[];
    middleware: Middleware[];
    addedPlugins: BCMSPluginInfo[];
    stringUtil: StringUtility;
    shimService: BCMSShimService;
    fs: FS;
    logger: Logger;
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
      data.logger.error(
        '',
        `Plugin with name "${bcmsConfig.plugins[data.index]}" does not exist.`,
      );
      return {
        controllers: data.controllers,
        middleware: data.middleware,
      };
    }
    await injectPaths(data.fs, pluginPath);
    const pluginDirPath = path.join(
      process.cwd(),
      'node_modules',
      bcmsConfig.plugins[data.index],
    );
    if (await data.fs.exist(path.join(pluginPath, 'main.ts'), true)) {
      pluginPath = path.join(pluginPath, 'main.ts');
    } else if (await data.fs.exist(path.join(pluginPath, 'main.js'), true)) {
      pluginPath = path.join(pluginPath, 'main.js');
    } else {
      data.logger.error(
        '',
        `Plugin with name "${
          bcmsConfig.plugins[data.index]
        }" does not contain "main.js" or "main.ts" file at path ${pluginPath}.`,
      );
      return {
        controllers: data.controllers,
        middleware: data.middleware,
      };
    }
    const plugin: { default: BCMSPlugin } = await import(pluginPath);
    if (!plugin || !plugin.default || !plugin.default.name) {
      return {
        controllers: data.controllers,
        middleware: data.middleware,
      };
    }
    plugin.default.name = data.stringUtil.toSlug(plugin.default.name);
    if (data.addedPlugins.find((e) => e.name === plugin.default.name)) {
      data.logger.error(
        '',
        `Plugin with name "${plugin.default.name}" is duplicate.`,
      );
      return {
        controllers: data.controllers,
        middleware: data.middleware,
      };
    }
    data.addedPlugins.push({
      name: plugin.default.name,
      dirPath: pluginDirPath,
    });
    const verifyResult: { ok: boolean } = await data.shimService.send({
      uri: `/instance/plugin/verify/${plugin.default.name}`,
      payload: {},
    });

    if (!verifyResult.ok) {
      data.logger.error(
        '',
        `Plugin "${plugin.default.name}" is denied by the BCMS Cloud.`,
      );
      return {
        controllers: data.controllers,
        middleware: data.middleware,
      };
    }

    if (plugin.default.controllers) {
      for (let j = 0; j < plugin.default.controllers.length; j++) {
        data.controllers.push(() => {
          const controller = plugin.default.controllers[j]();
          controller.path = `/api/plugin/${plugin.default.name}`;
          return controller;
        });
      }
    }
    if (plugin.default.middleware) {
      for (let j = 0; j < plugin.default.middleware.length; j++) {
        data.middleware.push(() => {
          const mid = plugin.default.middleware[j]();
          mid.path = `/api/plugin/${plugin.default.name}`;
          return mid;
        });
      }
    }
    data.logger.info('', plugin.default.name + ' loaded successfully');
    return await loadNext({
      index: data.index + 1,
      controllers: data.controllers,
      middleware: data.middleware,
      addedPlugins: data.addedPlugins,
      shimService: data.shimService,
      stringUtil: data.stringUtil,
      fs: data.fs,
      logger: data.logger,
    });
  }
  async function installLocalPlugins(fs: FS) {
    const cp = useBcmsChildProcess();
    const files = await fs.readdir(path.join(process.cwd(), 'plugins'));
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (file.endsWith('.tgz')) {
        await cp.spawn('npm', ['i', '--save', `./plugins/${file}`], {
          stdio: 'ignore',
        });
      }
    }
  }

  return {
    name: 'Plugins',
    initialize(moduleConfig) {
      const addedPlugins: BCMSPluginInfo[] = [];
      const stringUtil = useStringUtility();
      const shimService = useBcmsShimService();
      const fs = useFS();
      const logger = useLogger({ name: 'Plugin loader' });

      if (bcmsConfig.plugins) {
        installLocalPlugins(fs)
          .then(async () => {
            const result = await loadNext({
              index: 0,
              controllers: [],
              middleware: [],
              addedPlugins,
              stringUtil,
              shimService,
              fs,
              logger,
            });
            pluginManager = {
              getList() {
                return addedPlugins.map((e) => e.name);
              },
              getListInfo() {
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
        pluginManager = {
          getList() {
            return addedPlugins.map((e) => e.name);
          },
          getListInfo() {
            return addedPlugins;
          },
        };
        moduleConfig.next();
      }
    },
  };
}

let pluginManager: BCMSPluginManager;

export function useBcmsPluginManager(): BCMSPluginManager {
  return pluginManager;
}
