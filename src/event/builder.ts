import { useObjectUtility } from '@becomes/purple-cheetah';
import { ObjectUtilityError } from '@becomes/purple-cheetah/types';
import type { BCMSEvent } from '../_event';
import { BCMSEventSchema } from './types';

export function createBcmsEvent(settings: BCMSEvent): () => BCMSEvent {
  return () => {
    const objectUtil = useObjectUtility();
    const checkSettings = objectUtil.compareWithSchema(
      settings,
      BCMSEventSchema,
      'settings',
    );
    if (checkSettings instanceof ObjectUtilityError) {
      throw Error(__filename + ' -> ' + checkSettings.message);
    }
    return settings;
  };
}
