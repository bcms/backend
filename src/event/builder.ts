import {
  BCMSEventConfig,
  BCMSEventConfigScope,
  BCMSEventConfigMethod,
} from './interfaces';
import { BCMSEvent } from './interfaces';
import { ObjectUtility } from '@becomes/purple-cheetah';

export function BCMSEventBuilder(settings: {
  config: BCMSEventConfig;
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
  // if (!BCMSEventConfigScope[settings.config.scope]) {
  //   throw Error(
  //     `[ ${__dirname} ] --> Scope "${settings.config.scope}" is not allowed.`,
  //   );
  // }
  // if (!BCMSEventConfigMethod[settings.config.method]) {
  //   throw Error(
  //     `[ ${__dirname} ] --> Method "${settings.config.method}" is not allowed.`,
  //   );
  // }
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
