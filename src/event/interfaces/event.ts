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
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    data: any,
  ) => Promise<void>;
}
