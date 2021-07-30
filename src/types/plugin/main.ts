import type {
  Controller,
  Middleware,
  ObjectSchema,
} from '@becomes/purple-cheetah/types';

export interface BCMSPluginConfig {
  name: string;
  controllers?: Controller[],
  middleware?: Middleware[],
}
export const BCMSPluginConfigSchema: ObjectSchema = {
  name: {
    __type: 'string',
    __required: true,
  },
  controllers: {
    __type: 'array',
    __required: false,
    __child: {
      __type: 'function',
    },
  },
  middleware: {
    __type: 'array',
    __required: false,
    __child: {
      __type: 'function',
    },
  },
};

export interface BCMSPlugin {
  name: string;
  controllers: Controller[];
  middleware: Middleware[];
}
export const BCMSPluginSchema: ObjectSchema = {
  name: {
    __type: 'string',
    __required: true,
  },
  controllers: {
    __type: 'array',
    __required: true,
    __child: {
      __type: 'object',
    },
  },
  middleware: {
    __type: 'array',
    __required: true,
    __child: {
      __type: 'object',
    },
  },
};

export interface BCMSPluginManager {
  getList(): string[];
}
