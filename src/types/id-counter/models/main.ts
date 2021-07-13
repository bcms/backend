import {
  FSDBEntity,
  FSDBEntitySchema,
} from '@becomes/purple-cheetah-mod-fsdb/types';
import {
  MongoDBEntity,
  MongoDBEntitySchema,
} from '@becomes/purple-cheetah-mod-mongodb/types';
import type { ObjectSchema } from '@becomes/purple-cheetah/types';
import { Schema } from 'mongoose';

export interface BCMSIdCounterProps {
  name: string;
  forId: string;
  count: number;
}

export type BCMSIdCounterFSDB = FSDBEntity & BCMSIdCounterProps;
export const BCMSIdCounterFSDBSchema: ObjectSchema = {
  ...FSDBEntitySchema,
  name: {
    __type: 'string',
    __required: true,
  },
  forId: {
    __type: 'string',
    __required: true,
  },
  count: {
    __type: 'number',
    __required: true,
  },
};

export type BCMSIdCounterMongoDB = MongoDBEntity & BCMSIdCounterProps;
export const BCMSIdCounterMongoDBSchema = new Schema({
  ...MongoDBEntitySchema,
  name: {
    type: String,
    required: true,
  },
  forId: {
    type: String,
    required: true,
  },
  count: {
    type: Number,
    required: true,
  },
});

export type BCMSIdCounter = BCMSIdCounterMongoDB | BCMSIdCounterFSDB;
