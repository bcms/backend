import * as path from 'path';
import { Module, ObjectUtilityError } from '@becomes/purple-cheetah/types';
import { useFS, useLogger, useObjectUtility } from '@becomes/purple-cheetah';
import { BCMSJob, BCMSJobSchema } from './types';
import { CronJob } from 'cron';

export function createBcmsJobModule(): Module {
  return {
    name: 'Job',
    initialize(moduleConfig) {
      const jobsPath = path.join(process.cwd(), 'jobs');
      const objectUtil = useObjectUtility();
      const fs = useFS();
      const logger = useLogger('Job');

      fs.exist(jobsPath)
        .then(async (result) => {
          if (result) {
            const files = await fs.readdir(jobsPath);
            for (let i = 0; i < files.length; i++) {
              const fileName = files[i];
              if (fileName.endsWith('.js') || fileName.endsWith('.ts')) {
                const jobFn: () => BCMSJob = await import(
                  path.join(jobsPath, fileName)
                );
                const checkFn = objectUtil.compareWithSchema(
                  { fn: jobFn },
                  {
                    fn: {
                      __type: 'function',
                      __required: true,
                    },
                  },
                  fileName,
                );
                if (checkFn instanceof ObjectUtilityError) {
                  moduleConfig.next(Error(checkFn.message));
                  return;
                }
                const job = jobFn();
                const checkObject = objectUtil.compareWithSchema(
                  job,
                  BCMSJobSchema,
                  fileName,
                );
                if (checkObject instanceof ObjectUtilityError) {
                  moduleConfig.next(Error(checkObject.message));
                  return;
                }
                const cronJob = new CronJob(
                  [
                    job.cron.minute,
                    job.cron.hour,
                    job.cron.dayOfMonth,
                    job.cron.month,
                    job.cron.dayOfWeek,
                  ].join(' '),
                  async () => {
                    try {
                      await job.handler();
                    } catch (error) {
                      logger.error(
                        '',
                        'Job was killed due to unhandled error.',
                      );
                      logger.error(path.join(jobsPath, fileName), error);
                      cronJob.stop();
                    }
                  },
                );
                cronJob.start();
              }
            }
          }
          moduleConfig.next();
        })
        .catch((error) => {
          moduleConfig.next(error);
        });
    },
  };
}
