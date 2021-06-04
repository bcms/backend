import type { BCMSPropMeta } from '../../prop';
import {
  FSDBEntity,
  MongoDBEntity,
  ObjectSchema,
  MongoDBEntitySchema,
} from '@becomes/purple-cheetah/types';
import { Schema } from 'mongoose';

export interface BCMSGroupProps {
  name: string;
  label: string;
  desc: string;
  props: BCMSPropMeta[];
}

export type BCMSGroupFSDB = FSDBEntity & BCMSGroupProps;
export type BCMSGroupMongoDB = MongoDBEntity & BCMSGroupProps;
export type BCMSGroup = BCMSGroupMongoDB | BCMSGroupFSDB;

export const BCMSGroupMongoDBSchema = new Schema({
  ...MongoDBEntitySchema,
  name: String,
  label: String,
  desc: String,
  props: [Object],
});

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
