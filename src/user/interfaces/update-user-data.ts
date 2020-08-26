import { UserPolicyCRUD, UserPolicyCRUDSchema } from './policy';
import { ObjectSchema } from '@becomes/purple-cheetah';

export interface UpdateUserData {
  _id: string;
  email?: string;
  password?: {
    current: string;
    new: string;
  };
  customPool?: {
    personal?: {
      firstName?: string;
      lastName?: string;
    };
    address?: {
      country?: string;
      city?: string;
      state?: string;
      zip?: string;
      street?: {
        name?: string;
        number?: string;
      };
    };
    policy?: {
      media?: UserPolicyCRUD;
      customPortal?: UserPolicyCRUD;
      templates?: Array<UserPolicyCRUD & { _id: string }>;
      webhooks?: Array<
        UserPolicyCRUD & {
          _id: string;
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
  email: {
    __type: 'string',
    __required: false,
  },
  password: {
    __type: 'object',
    __required: false,
    __child: {
      current: {
        __type: 'string',
        __required: true,
      },
      new: {
        __type: 'string',
        __required: true,
      },
    },
  },
  customPool: {
    __type: 'object',
    __required: false,
    __child: {
      personal: {
        __type: 'object',
        __required: false,
        __child: {
          firstName: {
            __type: 'string',
            __required: false,
          },
          lastName: {
            __type: 'string',
            __required: false,
          },
        },
      },
      address: {
        __type: 'object',
        __required: false,
        __child: {
          country: {
            __type: 'string',
            __required: false,
          },
          city: {
            __type: 'string',
            __required: false,
          },
          state: {
            __type: 'string',
            __required: false,
          },
          zip: {
            __type: 'string',
            __required: false,
          },
          street: {
            __type: 'object',
            __required: false,
            __child: {
              name: {
                __type: 'string',
                __required: false,
              },
              number: {
                __type: 'string',
                __required: false,
              },
            },
          },
        },
      },
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
