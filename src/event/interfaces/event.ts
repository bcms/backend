import {
  BCMSEventConfig,
  BCMSEventConfigScope,
  BCMSEventConfigMethod,
} from './config';

export interface BCMSEvent {
  config: BCMSEventConfig;
  handler: (
    scope: BCMSEventConfigScope | string,
    method: BCMSEventConfigMethod | string,
    data: any,
  ) => Promise<void>;
}
