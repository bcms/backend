import {
  IEntity,
  Role,
  Entity,
  ObjectSchema,
} from '@becomes/purple-cheetah';
import {
  RefreshToken,
  UserCustomPool,
  RefreshTokenSchema,
  UserCustomPoolSchema,
} from '../interfaces';
import { Types, Schema } from 'mongoose';

export interface IUser extends IEntity {
  username: string;
  email: string;
  password: string;
  roles: Role[];
  refreshTokens: RefreshToken[];
  customPool: UserCustomPool;
}

export interface ProtectedUser {
  _id: string;
  createdAt: number;
  updatedAt: number;
  username: string;
  email: string;
  roles: Role[];
  customPool: UserCustomPool;
}

export class User implements Entity {
  constructor(
    // tslint:disable-next-line: variable-name
    public _id: Types.ObjectId,
    public createdAt: number,
    public updatedAt: number,
    public username: string,
    public email: string,
    public password: string,
    public roles: Role[],
    public refreshTokens: RefreshToken[],
    public customPool: UserCustomPool,
  ) {}

  public static get schema(): Schema {
    return new Schema({
      _id: Types.ObjectId,
      createdAt: Number,
      updatedAt: Number,
      username: String,
      email: String,
      password: String,
      roles: [Object],
      refreshTokens: [Object],
      customPool: Object,
    });
  }
}

export const UserSchema: ObjectSchema = {
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
  username: {
    __type: 'string',
    __required: true,
  },
  email: {
    __type: 'string',
    __required: true,
  },
  password: {
    __type: 'string',
    __required: true,
  },
  roles: {
    __type: 'array',
    __required: true,
    __child: {
      __type: 'object',
      __content: {
        name: {
          __type: 'string',
          __required: true,
        },
        permissions: {
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
      },
    },
  },
  refreshTokens: {
    __type: 'array',
    __required: true,
    __child: {
      __type: 'object',
      __content: RefreshTokenSchema,
    },
  },
  customPool: {
    __type: 'object',
    __required: true,
    __child: UserCustomPoolSchema,
  },
};
