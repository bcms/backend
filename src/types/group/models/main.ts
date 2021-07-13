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
import type { BCMSProp } from '../../prop';

export interface BCMSGroupProps {
  cid: string;
  name: string;
  label: string;
  desc: string;
  props: BCMSProp[];
}

export type BCMSGroupFSDB = FSDBEntity & BCMSGroupProps;
export const BCMSGroupFSDBSchema: ObjectSchema = {
  ...FSDBEntitySchema,
  cid: {
    __type: 'string',
    __required: true,
  },
  name: {
    __type: 'string',
    __required: true,
  },
  label: {
    __type: 'string',
    __required: true,
  },
  desc: {
    __type: 'string',
    __required: true,
  },
};

export type BCMSGroupMongoDB = MongoDBEntity & BCMSGroupProps;
export const BCMSGroupMongoDBSchema = new Schema({
  ...MongoDBEntitySchema,
  cid: {
    type: String,
    required: true,
  },
  name: String,
  label: String,
  desc: String,
  props: [Object],
});

export type BCMSGroup = BCMSGroupMongoDB | BCMSGroupFSDB;
