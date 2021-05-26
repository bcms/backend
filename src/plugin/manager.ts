import * as fs from 'fs';
import * as util from 'util';
import * as path from 'path';
import {
  ControllerPrototype,
  Logger,
  MiddlewarePrototype,
} from '@becomes/purple-cheetah';
import { ShimService } from '../shim';

export class PluginManager {
  private static readonly logger = new Logger('BCMSBackendPlugin');
  private static list: string[] = [];
  private static controllers: { [name: string]: ControllerPrototype } = {};
  private static middlewares: { [name: string]: MiddlewarePrototype } = {};

  private static async exist(...p: string[]) {
    return await util.promisify(fs.exists)(path.join(process.cwd(), ...p));
  }
  private static async readdir(...p: string[]) {
    return await util.promisify(fs.readdir)(path.join(process.cwd(), ...p));
  }
  // private static error(location: string, message: string) {
  //   this.logger.error(location, message);
  //   throw Error(message);
  // }
  private static fromKebabToCamel(s: string): string {
    return s
      .split('-')
      .map(
        (e) => e.substring(0, 1).toUpperCase() + e.substring(1).toLowerCase(),
      )
      .join('');
  }

  static getList() {
    return this.list;
  }
  static getControllers(): ControllerPrototype[] {
    return Object.keys(this.controllers).map((e) => {
      return this.controllers[e];
    });
  }
  static getMiddlewares(): MiddlewarePrototype[] {
    return Object.keys(this.middlewares).map((e) => {
      return this.middlewares[e];
    });
  }
  static async load(loadPlugins: string[]) {
    // this.list = loadPlugins;
    for (let i = 0; i < loadPlugins.length; i++) {
      const pluginName = loadPlugins[i];
      const verifyResult: { ok: boolean } = await ShimService.send(
        `/instance/plugin/verify/${pluginName}`,
        {},
      );
      if (verifyResult.ok) {
        let loadBasePath = [];
        if (await this.exist('plugins', pluginName, 'backend')) {
          loadBasePath = ['plugins', pluginName, 'backend'];
        } else if (await this.exist('node_modules', pluginName, 'backend')) {
          loadBasePath = ['node_modules', pluginName, 'backend'];
        }
        this.list.push(pluginName);
        if (loadBasePath.length > 0) {
          if (await this.exist(...loadBasePath, 'controllers')) {
            const files = (
              await this.readdir(...loadBasePath, 'controllers')
            ).filter((e) => e.endsWith('.js') || e.endsWith('.ts'));
            for (let j = 0; j < files.length; j++) {
              const fileName = files[j];
              const imp = await import(
                path.join(
                  process.cwd(),
                  ...loadBasePath,
                  'controllers',
                  fileName,
                )
              );
              const controllerName = fileName.substring(0, fileName.length - 3);
              this.controllers[controllerName] = new imp[controllerName]();
              this.controllers[
                controllerName
              ].name = `Plugin${this.fromKebabToCamel(
                pluginName,
              )}${controllerName}`;
              this.controllers[
                controllerName
              ].baseUri = `/api/plugin/${pluginName}${
                this.controllers[controllerName].baseUri.startsWith('/')
                  ? ''
                  : '/'
              }${this.controllers[controllerName].baseUri}`;
            }
          }
          if (await this.exist(...loadBasePath, 'middleware')) {
            const files = (
              await this.readdir(...loadBasePath, 'middleware')
            ).filter((e) => e.endsWith('.js') || e.endsWith('.ts'));
            for (let j = 0; j < files.length; j++) {
              const fileName = files[j];
              const imp = await import(
                path.join(
                  process.cwd(),
                  ...loadBasePath,
                  'middleware',
                  fileName,
                )
              );
              const middlewareName = fileName.substring(0, fileName.length - 3);
              this.middlewares[middlewareName] = new imp[middlewareName]();
              this.middlewares[
                middlewareName
              ].uri = `/api/plugin/${pluginName}${
                this.middlewares[middlewareName].uri.startsWith('/') ? '' : '/'
              }${this.middlewares[middlewareName].uri}`;
            }
          }
        }
      } else {
        this.logger.warn('load', `Plugin "${pluginName}" is denied.`);
      }
    }
  }
}
