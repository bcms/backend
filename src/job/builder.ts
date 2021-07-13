import { useObjectUtility } from '@becomes/purple-cheetah';
import { ObjectUtilityError } from '@becomes/purple-cheetah/types';
import { BCMSJob, BCMSJobSchema } from '../types';

export function createBcmsJob(settings: BCMSJob): () => BCMSJob {
  return () => {
    const objectUtil = useObjectUtility();
    const checkSettings = objectUtil.compareWithSchema(
      settings,
      BCMSJobSchema,
      'settings',
    );
    if (checkSettings instanceof ObjectUtilityError) {
      throw Error(checkSettings.message);
    }
    return settings;
  };
}
