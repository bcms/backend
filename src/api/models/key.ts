import {
  IEntity,
  ObjectSchema,
} from '@becomes/purple-cheetah';
import { Types, Schema } from 'mongoose';
import { UserPolicyCRUD, UserPolicyCRUDSchema } from '../../user';

/**
 * Defines what specific Key can do with Template/Templates.
 */
export interface ApiKeyAccess {
  templates: Array<UserPolicyCRUD & { _id: string }>;
  functions: Array<{
    name: string;
  }>;
}

export interface IApiKey extends IEntity {
  userId: string;
  name: string;
  desc: string;
  blocked: boolean;
  secret: string;
  access: ApiKeyAccess;
}

/**
 * Object that defines API Key.
 */
export class ApiKey {
  constructor(
    // tslint:disable-next-line:variable-name
    public _id: Types.ObjectId,
    public createdAt: number,
    public updatedAt: number,
    /** ID of the user that created a Key. */
    public userId: string,
    /** User defined name. */
    public name: string,
    public desc: string,
    /** Is Key allowed to make API calls. */
    public blocked: boolean,
    /** Secret used for creating and verifying requests. */
    public secret: string,
    /** What API calls can Key make. */
    public access: ApiKeyAccess,
  ) {}

  public static get schema(): Schema {
    return new Schema({
      _id: Types.ObjectId,
      createdAt: Number,
      updatedAt: Number,
      userId: String,
      name: String,
      desc: String,
      blocked: Object,
      secret: String,
      access: Object,
    });
  }
}

export const ApiKeyAccessSchema: ObjectSchema = {
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
export const ApiKeySchema: ObjectSchema = {
  _id: {
    __type: 'string',
    __required: true,
  },
  createdAt: {
    __type: 'number',
    __required: true,
  },
  updatedAt: {
    __type: 'number',
    __required: true,
  },
  userId: {
    __type: 'string',
    __required: true,
  },
  name: {
    __type: 'string',
    __required: true,
  },
  desc: {
    __type: 'string',
    __required: true,
  },
  blocked: {
    __type: 'boolean',
    __required: true,
  },
  secret: {
    __type: 'string',
    __required: true,
  },
  access: {
    __type: 'object',
    __required: true,
    __child: ApiKeyAccessSchema,
  },
};
