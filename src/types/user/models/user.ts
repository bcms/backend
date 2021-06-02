import {
  JWTRole,
  MongoDBEntity,
  ObjectSchema,
  JWTRoleSchema,
  FSDBEntitySchema,
  FSDBEntity,
  MongoDBEntitySchema,
} from '@becomes/purple-cheetah/types';
import { Schema } from 'mongoose';
import { UserCustomPool, UserCustomPoolSchema } from './custom-pool';
import type { UserPersonal } from './personal';

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

export type UserMongoDB = MongoDBEntity & UserProps;
export type UserFSDB = FSDBEntity & UserProps;

export interface JWTProps {
  customPool: UserCustomPool;
}

export const UserMongoDBSchema = new Schema({
  ...MongoDBEntitySchema,
  username: { type: String, required: true },
  email: { type: String, required: true },
  password: { type: String, required: true },
  roles: [Object],
  customPool: Object,
});

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
