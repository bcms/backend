import {
  BCMSEventConfig,
  BCMSEventConfigScope,
  BCMSEventConfigMethod,
} from './config';

export interface BCMSEvent {
  config: BCMSEventConfig;
  handler: (
    scope: BCMSEventConfigScope,
    method: BCMSEventConfigMethod,
    data: any,
  ) => Promise<void>;
}
