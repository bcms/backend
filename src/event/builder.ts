import {
  BCMSEventConfig,
} from './interfaces';
import { BCMSEvent } from './interfaces';
import { ObjectUtility } from '@becomes/purple-cheetah';

export function BCMSEventBuilder(settings: {
  config: BCMSEventConfig;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  handler: (data: any) => Promise<void>;
}): BCMSEvent {
  try {
    ObjectUtility.compareWithSchema(
      settings.config,
      {
        scope: {
          __type: 'string',
          __required: true,
        },
        method: {
          __type: 'string',
          __required: true,
        },
      },
      'config',
    );
  } catch (e) {
    throw Error(`[ ${__dirname} ] --> ${e.message}`);
  }
  if (typeof settings.handler !== 'function') {
    throw Error(
      `[ ${__dirname} ] --> Expected "handler" to be` +
        ` "function" but got "${typeof settings.handler}".`,
    );
  }
  return {
    config: settings.config,
    handler: settings.handler,
  };
}
