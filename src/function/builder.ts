import { BCMSFunctionConfig, BCMSFunction } from './interfaces';
import { Request } from 'express';
import { ObjectUtility } from '@becomes/purple-cheetah';

export function BCMSFunctionBuilder(settings: {
  config: BCMSFunctionConfig;
  handler: (request: Request) => Promise<any>;
}): BCMSFunction {
  try {
    ObjectUtility.compareWithSchema(
      settings.config,
      {
        name: {
          __type: 'string',
          __required: true,
        },
        public: {
          __type: 'boolean',
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
    config: {
      name: settings.config.name,
      public: settings.config.public,
    },
    handler: settings.handler,
  };
}
