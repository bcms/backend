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

export interface BCMSStatusProps {
  label: string;
  name: string;
  color: string;
}

export type BCMSStatusFSDB = FSDBEntity & BCMSStatusProps;
export const BCMSStatusFSDBSchema: ObjectSchema = {
  ...FSDBEntitySchema,
  label: {
    __type: 'string',
    __required: true,
  },
  name: {
    __type: 'string',
    __required: true,
  },
  color: {
    __type: 'string',
    __required: true,
  },
};

export type BCMSStatusMongoDB = MongoDBEntity & BCMSStatusProps;
export const BCMSStatusMongoDBSchema = new Schema({
  ...MongoDBEntitySchema,
  label: {
    type: String,
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  color: String,
});

export type BCMSStatus = BCMSStatusFSDB | BCMSStatusMongoDB;
export type BCMSStatusCross = BCMSStatusFSDB & BCMSStatusMongoDB;
