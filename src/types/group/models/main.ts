import type { BCMSPropMeta } from '../../prop';
import type { ObjectSchema } from '@becomes/purple-cheetah/types';
import { Schema } from 'mongoose';
import type { FSDBEntity } from '@becomes/purple-cheetah-mod-fsdb/types';
import {
  MongoDBEntity,
  MongoDBEntitySchema,
} from '@becomes/purple-cheetah-mod-mongodb/types';

export interface BCMSGroupProps {
  name: string;
  label: string;
  desc: string;
  props: BCMSPropMeta[];
}

export type BCMSGroupMongoDB = MongoDBEntity & BCMSGroupProps;
export const BCMSGroupMongoDBSchema = new Schema({
  ...MongoDBEntitySchema,
  name: { type: String, required: true },
  label: { type: String, required: true },
  desc: { type: String, required: true },
  props: [Object],
});

export type BCMSGroupFSDB = FSDBEntity & BCMSGroupProps;
export const BCMSGroupFSDBSchema: ObjectSchema = {
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
      __content: {},
    },
  },
};

export type BCMSGroup = BCMSGroupMongoDB | BCMSGroupFSDB;
