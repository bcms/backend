import type { ObjectSchema } from '@becomes/purple-cheetah/types';

export interface UserPolicyCRUD {
  get: boolean;
  post: boolean;
  put: boolean;
  delete: boolean;
}

export interface UserPolicy {
  media: UserPolicyCRUD;
  customPortal: UserPolicyCRUD;
  templates: Array<{ _id: string } & UserPolicyCRUD>;
  webhooks: Array<{ _id: string } & UserPolicyCRUD>;
  plugins?: Array<{ name: string } & UserPolicyCRUD>;
}

export const UserPolicyCRUDSchema: ObjectSchema = {
  get: {
    __type: 'boolean',
    __required: true,
  },
  post: {
    __type: 'boolean',
    __required: true,
  },
  put: {
    __type: 'boolean',
    __required: true,
  },
  delete: {
    __type: 'boolean',
    __required: true,
  },
};

export const UserPolicySchema: ObjectSchema = {
  media: {
    __type: 'object',
    __required: true,
    __child: UserPolicyCRUDSchema,
  },
  customPortal: {
    __type: 'object',
    __required: true,
    __child: UserPolicyCRUDSchema,
  },
  templates: {
    __type: 'array',
    __required: true,
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
    __required: true,
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
  plugins: {
    __type: 'array',
    __required: false,
    __child: {
      __type: 'object',
      __content: {
        name: {
          __type: 'string',
          __required: true,
        },
        ...UserPolicyCRUDSchema,
      },
    },
  },
};
