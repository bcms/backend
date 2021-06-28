import * as path from 'path';
import { Job } from './interfaces';
import { Logger, FSUtil, ObjectUtility } from '@becomes/purple-cheetah';
import { CronJob } from 'cron';

export class JobManager {
  private static logger = new Logger('EventManager');

  public static async init() {
    await this.run();
  }

  public static async run() {
    const eventsPath = path.join(process.cwd(), 'jobs');
    if (await FSUtil.exist(eventsPath)) {
      const files = await FSUtil.readdir(eventsPath);
      files.forEach(async (fileName) => {
        if (fileName.endsWith('.js')) {
          const file: { job: Job } = await import(
            // tslint:disable-next-line: trailing-comma
            path.join(eventsPath, fileName)
          );
          try {
            ObjectUtility.compareWithSchema(
              file,
              {
                job: {
                  __type: 'object',
                  __required: true,
                  __child: {
                    cron: {
                      __type: 'object',
                      __required: true,
                      __child: {
                        minute: {
                          __type: 'string',
                          __required: true,
                        },
                        hour: {
                          __type: 'string',
                          __required: true,
                        },
                        dayOfMonth: {
                          __type: 'string',
                          __required: true,
                        },
                        month: {
                          __type: 'string',
                          __required: true,
                        },
                        dayOfWeek: {
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
          if (typeof file.job.handler !== 'function') {
            this.logger.error(
              '',
              `Expected "handler" export to be a "function"` +
                ` but got "${typeof file.job.handler}" in file` +
                ` "events/${fileName}".`,
            );
            return;
          }
          const job = new CronJob(
            [
              file.job.cron.minute,
              file.job.cron.hour,
              file.job.cron.dayOfMonth,
              file.job.cron.month,
              file.job.cron.dayOfWeek,
            ].join(' '),
            async () => {
              try {
                await file.job.handler();
              } catch (error) {
                this.logger.error(path.join(eventsPath, fileName), error);
                job.stop();
              }
            },
          );
          job.start();
        }
      });
    }
  }
}
