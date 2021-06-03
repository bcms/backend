import { UserPolicyCRUD, UserPolicyCRUDSchema } from './models';
import type { ObjectSchema } from '@becomes/purple-cheetah/types';

export interface UpdateUserData {
  _id: string;
  customPool?: {
    policy?: {
      media?: UserPolicyCRUD;
      customPortal?: UserPolicyCRUD;
      templates?: Array<UserPolicyCRUD & { _id: string }>;
      webhooks?: Array<
        UserPolicyCRUD & {
          _id: string;
        }
      >;
      plugins?: Array<
        UserPolicyCRUD & {
          name: string;
        }
      >;
    };
  };
}

export const UpdateUserDataSchema: ObjectSchema = {
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
            __child: UserPolicyCRUDSchema,
          },
          customPortal: {
            __type: 'object',
            __required: false,
            __child: UserPolicyCRUDSchema,
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
                ...UserPolicyCRUDSchema,
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
                ...UserPolicyCRUDSchema,
              },
            },
          },
        },
      },
    },
  },
};
