import type { ObjectSchema } from '@becomes/purple-cheetah/types';

// eslint-disable-next-line no-shadow
export enum BCMSEventConfigScope {
  ALL = 'ALL',
  ENTRY = 'ENTRY',
  GROUP = 'GROUP',
  LANGUAGE = 'LANGUAGE',
  MEDIA = 'MEDIA',
  TEMPLATE = 'TEMPLATE',
  USER = 'USER',
  WIDGET = 'WIDGET',
  API_KEY = 'API_KEY',
}

// eslint-disable-next-line no-shadow
export enum BCMSEventConfigMethod {
  ALL = 'ALL',
  ADD = 'ADD',
  UPDATE = 'UPDATE',
  DELETE = 'DELETE',
}

export interface BCMSEventConfig {
  scope: BCMSEventConfigScope | string;
  method: BCMSEventConfigMethod | string;
}

export const BCMSEventConfigSchema: ObjectSchema = {
  scope: {
    __type: 'string',
    __required: true,
  },
  method: {
    __type: 'string',
    __required: true,
  },
};
