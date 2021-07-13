import type { ObjectSchema } from '@becomes/purple-cheetah/types';
import { Schema } from 'mongoose';

export interface BCMSUserPolicyCRUD {
  get: boolean;
  post: boolean;
  put: boolean;
  delete: boolean;
}
export const BCMSUserPolicyCRUDFSDBSchema: ObjectSchema = {
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
export const BCMSUserPolicyCRUDMongoDBSchema = new Schema({
  // get: {
  //   type: Boolean,
  //   required: true,
  // },
  post: {
    type: Boolean,
    required: true,
  },
  put: {
    type: Boolean,
    required: true,
  },
  delete: {
    type: Boolean,
    required: true,
  },
});

export interface BCMSUserPolicy {
  media: BCMSUserPolicyCRUD;
  templates: Array<{ _id: string } & BCMSUserPolicyCRUD>;
  plugins?: Array<{ name: string } & BCMSUserPolicyCRUD>;
}
export const BCMSUserPolicyFSDBSchema: ObjectSchema = {
  media: {
    __type: 'object',
    __required: true,
    __child: BCMSUserPolicyCRUDFSDBSchema,
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
        ...BCMSUserPolicyCRUDFSDBSchema,
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
        ...BCMSUserPolicyCRUDFSDBSchema,
      },
    },
  },
};
export const BCMSUserPolicyMongoDBSchema = new Schema({
  media: {
    type: BCMSUserPolicyCRUDMongoDBSchema,
    required: true,
  },
  templates: {
    type: [Object],
  },
  plugins: [Object],
});
