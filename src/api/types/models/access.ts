import type { ObjectSchema } from '@becomes/purple-cheetah/types';
import { Schema } from 'mongoose';
import {
  BCMSUserPolicyCRUD,
  BCMSUserPolicyCRUDFSDBSchema,
} from '../../../types';

/**
 * Defines what specific Key can do with Template/Templates.
 */
export interface BCMSApiKeyAccess {
  templates: Array<BCMSUserPolicyCRUD & { _id: string }>;
  functions: Array<{
    name: string;
  }>;
}
export const BCMSApiKeyAccessFSDBSchema: ObjectSchema = {
  templates: {
    __type: 'array',
    __required: true,
    __child: {
      __type: 'object',
      __content: {
        ...BCMSUserPolicyCRUDFSDBSchema,
        _id: {
          __type: 'string',
          __required: true,
        },
      },
    },
  },
  functions: {
    __type: 'array',
    __required: true,
    __child: {
      __type: 'object',
      __content: {
        name: {
          __type: 'string',
          __required: true,
        },
      },
    },
  },
};
export const BCMSApiKeyAccessMongoDBSchema = new Schema({
  templates: {
    type: [Object],
  },
  functions: {
    type: [{ name: { type: String, required: true } }],
    required: true,
  },
});
