import * as path from 'path';
import * as chokidar from 'chokidar';
import { BCMSFunction } from './interfaces';
import {
  FSUtil,
  ObjectUtility,
  Logger,
  StringUtility,
} from '@becomes/purple-cheetah';
import { Types } from 'mongoose';

export class FunctionManager {
  private static fns: Array<BCMSFunction & { path: string }> = [];
  private static logger = new Logger('FunctionInitializer');
  private static watching = false;

  private static watch() {
    chokidar
      .watch(path.join(process.cwd(), 'functions'), {
        persistent: true,
      })
      .on('change', async (location) => {
        const hash = new Types.ObjectId().toHexString();
        const file = await FSUtil.read(location);
        await FSUtil.save(file, `${location}-${hash}`);
        await this.load(location, `${location}-${hash}`);
        await FSUtil.deleteFile(`${location}-${hash}`);
      });
  }

  private static async load(originalLocation: string, location: string) {
    const file: BCMSFunction = await import(location);
    try {
      ObjectUtility.compareWithSchema(
        file,
        {
          config: {
            __type: 'object',
            __required: true,
            __child: {
              name: {
                __type: 'string',
                __required: true,
              },
              public: {
                __type: 'boolean',
                __required: true,
              },
            },
          },
        },
        `"${location}"`,
      );
    } catch (error) {
      this.logger.error('', error.message);
      return;
    }
    if (typeof file.handler !== 'function') {
      this.logger.error(
        '',
        `Expected "handler" export to be a "function"` +
          ` but got "${typeof file.handler}" in file` +
          ` "${location}".`,
      );
      return;
    }
    file.config.name = StringUtility.createSlug(file.config.name);
    this.fns = this.fns.filter((e) => e.path !== originalLocation);
    this.fns.push({
      path: originalLocation,
      config: file.config,
      handler: file.handler,
    });
  }

  public static getAll(): Array<BCMSFunction & { path: string }> {
    return this.fns.map((e) => {
      return {
        config: e.config,
        handler: e.handler,
        path: e.path,
      };
    });
  }

  public static get(name: string) {
    return this.fns.find((e) => e.config.name === name);
  }

  public static clear() {
    this.fns = [];
  }

  public static async init() {
    if (process.env.DEV === 'true') {
      if (this.watching === false) {
        this.watching = true;
        await this.run();
        this.watch();
      }
    } else {
      await this.run();
    }
  }

  public static async run() {
    const fnsPath = path.join(process.cwd(), 'functions');
    if (await FSUtil.exist(fnsPath)) {
      const files = await FSUtil.readdir(fnsPath);
      files.forEach(async (fileName) => {
        if (fileName.endsWith('.js')) {
          const file: BCMSFunction = await import(
            // tslint:disable-next-line: trailing-comma
            path.join(fnsPath, fileName)
          );
          try {
            ObjectUtility.compareWithSchema(
              file,
              {
                config: {
                  __type: 'object',
                  __required: true,
                  __child: {
                    name: {
                      __type: 'string',
                      __required: true,
                    },
                    public: {
                      __type: 'boolean',
                      __required: true,
                    },
                  },
                },
              },
              `"${fileName}"`,
            );
          } catch (error) {
            this.logger.error('', error.message);
            return;
          }
          if (typeof file.handler !== 'function') {
            this.logger.error(
              '',
              `Expected "handler" export to be a "function"` +
                ` but got "${typeof file.handler}" in file` +
                ` "functions/${fileName}".`,
            );
            return;
          }
          file.config.name = StringUtility.createSlug(file.config.name);
          if (this.fns.find((e) => e.config.name === file.config.name)) {
            this.logger.error(
              '',
              `Duplicate of "${file.config.name}" function.` +
                ` This is not allowed.`,
            );
            return;
          }
          this.fns.push({
            path: path.join(fnsPath, fileName),
            config: file.config,
            handler: file.handler,
          });
        }
      });
    }
  }
}
