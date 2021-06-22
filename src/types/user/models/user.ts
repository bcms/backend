import {
  FSDBEntity,
  FSDBEntitySchema,
} from '@becomes/purple-cheetah-mod-fsdb/types';
import {
  JWT,
  JWTRole,
  JWTRoleSchema,
} from '@becomes/purple-cheetah-mod-jwt/types';
import {
  MongoDBEntity,
  MongoDBEntitySchema,
} from '@becomes/purple-cheetah-mod-mongodb/types';
import type { ObjectSchema } from '@becomes/purple-cheetah/types';
import { Schema } from 'mongoose';
import { UserCustomPool, UserCustomPoolSchema } from './custom-pool';

export interface UserProps {
  username: string;
  email: string;
  password: string;
  roles: JWTRole[];
  customPool: UserCustomPool;
}

export interface ProtectedUser {
  _id: string;
  createdAt: number;
  updatedAt: number;
  username: string;
  email: string;
  roles: JWTRole[];
  customPool: UserCustomPool;
}

export interface JWTProtectionType {
  accessToken: JWT<UserCustomPool>;
}

export type UserMongoDB = MongoDBEntity & UserProps;
export const UserMongoDBSchema = new Schema({
  ...MongoDBEntitySchema,
  username: { type: String, required: true },
  email: { type: String, required: true },
  password: { type: String, required: true },
  roles: [Object],
  customPool: Object,
});

export type UserFSDB = FSDBEntity & UserProps;
export const UserFSDBSchema: ObjectSchema = {
  ...FSDBEntitySchema,
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
      __content: JWTRoleSchema,
    },
  },
  customPool: {
    __type: 'object',
    __required: true,
    __child: UserCustomPoolSchema,
  },
};

export type User = UserMongoDB | UserFSDB;
