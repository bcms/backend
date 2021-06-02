import type { ObjectSchema } from '@becomes/purple-cheetah/types';

export interface BCMSConfig {
  port: number;
  jwt: {
    scope: string;
    secret: string;
    expireIn: number;
  };
  database: {
    prefix: string;
    fs?: boolean;
    mongodb?: {
      selfHosted?: {
        host: string;
        port: number;
        name: string;
        user: string;
        password: string;
      };
      atlas?: {
        name: string;
        user: string;
        password: string;
        cluster: string;
      };
    };
  };
  bodySizeLimit?: number;
  plugins?: string[];
}

export const BCMSConfigSchema: ObjectSchema = {
  port: {
    __type: 'number',
    __required: true,
  },
  jwt: {
    __type: 'object',
    __required: true,
    __child: {
      scope: {
        __type: 'string',
        __required: true,
      },
      secret: {
        __type: 'string',
        __required: true,
      },
      expireIn: {
        __type: 'number',
        __required: true,
      },
    },
  },
  database: {
    __type: 'object',
    __required: true,
    __child: {
      prefix: {
        __type: 'string',
        __required: true,
      },
      fs: {
        __type: 'boolean',
        __required: false,
      },
      mongodb: {
        __type: 'object',
        __required: false,
        __child: {
          selfHosted: {
            __type: 'object',
            __required: false,
            __child: {
              host: {
                __type: 'string',
                __required: true,
              },
              port: {
                __type: 'number',
                __required: true,
              },
              name: {
                __type: 'string',
                __required: true,
              },
              user: {
                __type: 'string',
                __required: true,
              },
              password: {
                __type: 'string',
                __required: true,
              },
              prefix: {
                __type: 'string',
                __required: true,
              },
            },
          },
          atlas: {
            __type: 'object',
            __required: false,
            __child: {
              name: {
                __type: 'string',
                __required: true,
              },
              user: {
                __type: 'string',
                __required: true,
              },
              password: {
                __type: 'string',
                __required: true,
              },
              prefix: {
                __type: 'string',
                __required: true,
              },
              cluster: {
                __type: 'string',
                __required: true,
              },
            },
          },
        },
      },
    },
  },
  bodySizeLimit: {
    __type: 'number',
    __required: false,
  },
  plugins: {
    __type: 'array',
    __required: false,
    __child: {
      __type: 'string',
    },
  },
};
