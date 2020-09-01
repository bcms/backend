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
  public static fns: Array<BCMSFunction & { path: string }> = [];
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
    const file: {fn: BCMSFunction} = await import(location);
    try {
      ObjectUtility.compareWithSchema(
        file,
        {
          fn: {
            __type: 'object',
            __required: true,
            __child: {
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
          },
        },
        `"${location}"`,
      );
    } catch (error) {
      this.logger.error('', error.message);
      return;
    }
    if (typeof file.fn.handler !== 'function') {
      this.logger.error(
        '',
        `Expected "handler" export to be a "function"` +
          ` but got "${typeof file.fn.handler}" in file` +
          ` "${location}".`,
      );
      return;
    }
    file.fn.config.name = StringUtility.createSlug(file.fn.config.name);
    this.fns = this.fns.filter((e) => e.path !== originalLocation);
    this.fns.push({
      path: originalLocation,
      config: file.fn.config,
      handler: file.fn.handler,
    });
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
          const file: { fn: BCMSFunction } = await import(
            // tslint:disable-next-line: trailing-comma
            path.join(fnsPath, fileName)
          );
          try {
            ObjectUtility.compareWithSchema(
              file,
              {
                fn: {
                  __type: 'object',
                  __required: true,
                  __child: {
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
                },
              },
              `"${fileName}"`,
            );
          } catch (error) {
            this.logger.error('', error.message);
            return;
          }
          if (typeof file.fn.handler !== 'function') {
            this.logger.error(
              '',
              `Expected "handler" export to be a "function"` +
                ` but got "${typeof file.fn.handler}" in file` +
                ` "functions/${fileName}".`,
            );
            return;
          }
          file.fn.config.name = StringUtility.createSlug(file.fn.config.name);
          if (this.fns.find((e) => e.config.name === file.fn.config.name)) {
            this.logger.error(
              '',
              `Duplicate of "${file.fn.config.name}" function.` +
                ` This is not allowed.`,
            );
            return;
          }
          this.fns.push({
            path: path.join(fnsPath, fileName),
            config: file.fn.config,
            handler: file.fn.handler,
          });
        }
      });
    }
  }
}
