import type { ObjectSchema } from '@becomes/purple-cheetah/types';
import { BCMSUserPolicyCRUD, BCMSUserPolicyCRUDFSDBSchema } from './models';

export interface BCMSUserUpdateData {
  _id: string;
  customPool?: {
    policy?: {
      media?: BCMSUserPolicyCRUD;
      customPortal?: BCMSUserPolicyCRUD;
      templates?: Array<BCMSUserPolicyCRUD & { _id: string }>;
      webhooks?: Array<
        BCMSUserPolicyCRUD & {
          _id: string;
        }
      >;
      plugins?: Array<
        BCMSUserPolicyCRUD & {
          name: string;
        }
      >;
    };
  };
}

export const BCMSUserUpdateDataSchema: ObjectSchema = {
  _id: {
    __type: 'string',
    __required: true,
  },
  customPool: {
    __type: 'object',
    __required: false,
    __child: {
      policy: {
        __type: 'object',
        __required: false,
        __child: {
          media: {
            __type: 'object',
            __required: false,
            __child: BCMSUserPolicyCRUDFSDBSchema,
          },
          customPortal: {
            __type: 'object',
            __required: false,
            __child: BCMSUserPolicyCRUDFSDBSchema,
          },
          entries: {
            __type: 'array',
            __required: false,
            __child: {
              __type: 'object',
              __content: {
                _id: {
                  __type: 'string',
                  __required: true,
                },
                ...BCMSUserPolicyCRUDFSDBSchema,
              },
            },
          },
          webhooks: {
            __type: 'array',
            __required: false,
            __child: {
              __type: 'object',
              __content: {
                _id: {
                  __type: 'string',
                  __required: true,
                },
                ...BCMSUserPolicyCRUDFSDBSchema,
              },
            },
          },
        },
      },
    },
  },
};
