import { BCMSFunctionConfig } from './config';
import { Request } from 'express';

export interface BCMSFunction {
  config: BCMSFunctionConfig;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  handler: (request: Request) => Promise<any>;
}
