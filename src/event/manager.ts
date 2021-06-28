import * as path from 'path';
import * as chokidar from 'chokidar';
import {
  BCMSEvent,
  BCMSEventConfigScope,
  BCMSEventConfigMethod,
} from './interfaces';
import { Types } from 'mongoose';
import { FSUtil, ObjectUtility, Logger } from '@becomes/purple-cheetah';

export class EventManager {
  private static events: Array<BCMSEvent & { path: string }> = [];
  private static watching = false;
  private static logger = new Logger('EventManager');

  private static watch() {
    chokidar
      .watch(path.join(process.cwd(), 'events'), {
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
    const file: { event: BCMSEvent } = await import(location);
    try {
      ObjectUtility.compareWithSchema(
        file,
        {
          event: {
            __type: 'object',
            __required: true,
            __child: {
              config: {
                __type: 'object',
                __required: true,
                __child: {
                  scope: {
                    __type: 'string',
                    __required: true,
                  },
                  method: {
                    __type: 'string',
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
    if (!BCMSEventConfigScope[file.event.config.scope]) {
      this.logger.error(
        'load',
        `[ ${__dirname} ] --> Scope "${file.event.config.scope}" is not allowed.`,
      );
      return;
    }
    if (!BCMSEventConfigMethod[file.event.config.method]) {
      this.logger.error(
        'load',
        `[ ${__dirname} ] --> Method "${file.event.config.method}" is not allowed.`,
      );
      return;
    }
    if (typeof file.event.handler !== 'function') {
      this.logger.error(
        '',
        `Expected "handler" export to be a "function"` +
          ` but got "${typeof file.event.handler}" in file` +
          ` "${location}".`,
      );
      return;
    }
    this.events = this.events.filter((e) => e.path !== originalLocation);
    this.events.push({
      path: originalLocation,
      config: file.event.config,
      handler: file.event.handler,
    });
  }

  public static async init() {
    await this.run();
    if (process.env.DEV === 'true') {
      if (this.watching === false) {
        this.watching = true;
        this.watch();
      }
    }
  }

  public static async run() {
    const eventsPath = path.join(process.cwd(), 'events');
    if (await FSUtil.exist(eventsPath)) {
      const files = await FSUtil.readdir(eventsPath);
      files.forEach(async (fileName) => {
        if (fileName.endsWith('.js')) {
          const file: { event: BCMSEvent } = await import(
            path.join(eventsPath, fileName)
          );
          try {
            ObjectUtility.compareWithSchema(
              file,
              {
                event: {
                  __type: 'object',
                  __required: true,
                  __child: {
                    config: {
                      __type: 'object',
                      __required: true,
                      __child: {
                        scope: {
                          __type: 'string',
                          __required: true,
                        },
                        method: {
                          __type: 'string',
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
            this.logger.error('run', error.message);
            return;
          }
          if (typeof file.event.handler !== 'function') {
            this.logger.error(
              '',
              `Expected "handler" export to be a "function"` +
                ` but got "${typeof file.event.handler}" in file` +
                ` "events/${fileName}".`,
            );
            return;
          }
          this.events.push({
            path: path.join(eventsPath, fileName),
            config: file.event.config,
            handler: file.event.handler,
          });
        }
      });
    }
  }

  public static async emit(
    scope: BCMSEventConfigScope | string,
    method: BCMSEventConfigMethod | string,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    data: any,
  ) {
    this.events.forEach(async (event) => {
      if (event.config.scope === scope) {
        if (
          event.config.method === method ||
          event.config.method === BCMSEventConfigMethod.ALL
        ) {
          try {
            await event.handler(scope, method, data);
          } catch (error) {
            this.logger.error('emit', {
              event,
              error,
            });
          }
        }
      }
    });
  }
}
