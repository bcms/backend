import { useObjectUtility } from '@becomes/purple-cheetah';
import { ObjectUtilityError } from '@becomes/purple-cheetah/types';
import { BCMSEvent, BCMSEventSchema } from './types';

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
