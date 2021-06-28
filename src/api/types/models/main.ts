import {
  FSDBEntity,
  FSDBEntitySchema,
} from '@becomes/purple-cheetah-mod-fsdb/types';
import type { MongoDBEntity } from '@becomes/purple-cheetah-mod-mongodb/types';
import type { ObjectSchema } from '@becomes/purple-cheetah/types';
import { Schema } from 'mongoose';
import {
  BCMSApiKeyAccess,
  BCMSApiKeyAccessFSDBSchema,
  BCMSApiKeyAccessMongoDBSchema,
} from './access';

export interface BCMSApiKeyProps {
  userId: string;
  name: string;
  desc: string;
  blocked: boolean;
  secret: string;
  access: BCMSApiKeyAccess;
}

export type BCMSApiKeyFSDB = FSDBEntity & BCMSApiKeyProps;
export const BCMSApiKeyFSDBSchema: ObjectSchema = {
  ...FSDBEntitySchema,
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
    __type: 'string',
    __required: true,
  },
  secret: {
    __type: 'string',
    __required: true,
  },
  access: {
    __type: 'object',
    __required: true,
    __child: BCMSApiKeyAccessFSDBSchema,
  },
};

export type BCMSApiKeyMongoDB = MongoDBEntity & BCMSApiKeyProps;
export const BCMSApiKeyMongoDBSchema = new Schema({
  userId: {
    type: String,
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  desc: String,
  blocked: {
    type: Boolean,
    required: true,
  },
  secret: {
    type: String,
    required: true,
  },
  access: {
    type: BCMSApiKeyAccessMongoDBSchema,
    required: true,
  },
});

export type BCMSApiKey = BCMSApiKeyFSDB | BCMSApiKeyMongoDB;
