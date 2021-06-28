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
import { BCMSProp, BCMSPropSchema } from '../../../types';

export interface BCMSGroupProps {
  name: string;
  label: string;
  desc: string;
  props: BCMSProp[];
}

export type BCMSGroupFSDB = FSDBEntity & BCMSGroupProps;
export const BCMSGroupFSDBSchema: ObjectSchema = {
  ...FSDBEntitySchema,
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
  props: {
    __type: 'array',
    __required: true,
    __child: {
      __type: 'object',
      __content: BCMSPropSchema,
    },
  },
};

export type BCMSGroupMongoDB = MongoDBEntity & BCMSGroupProps;
export const BCMSGroupMongoDBSchema = new Schema({
  ...MongoDBEntitySchema,
  name: String,
  label: String,
  desc: String,
  props: [Object],
});

export type BCMSGroup = BCMSGroupMongoDB | BCMSGroupFSDB;
