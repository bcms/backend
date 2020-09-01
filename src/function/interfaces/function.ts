import { BCMSFunctionConfig } from './config';
import { Request } from 'express';

export interface BCMSFunction {
  config: BCMSFunctionConfig;
  handler: (request: Request) => Promise<any>;
}
