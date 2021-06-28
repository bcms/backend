/* eslint-disable no-shadow */

export enum BCMSEventConfigScope {
  ENTRY = 'ENTRY',
  GROUP = 'GROUP',
  LANGUAGE = 'LANGUAGE',
  MEDIA = 'MEDIA',
  TEMPLATE = 'TEMPLATE',
  USER = 'USER',
  WIDGET = 'WIDGET',
  API_KEY = 'API_KEY',
}

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
