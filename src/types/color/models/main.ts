import {
  FSDBEntity,
  FSDBEntitySchema,
} from '@becomes/purple-cheetah-mod-fsdb/types';
import { MongoDBEntitySchemaString } from '@becomes/purple-cheetah-mod-mongodb/types';
import type { ObjectSchema } from '@becomes/purple-cheetah/types';
import { Schema } from 'mongoose';
import {
  BCMSColorSource,
  BCMSColorSourceMongoDBSchema,
  BCMSColorSourceSchema,
} from './color-source';

export interface BCMSColor extends FSDBEntity {
  cid: string;
  label: string;
  name: string;
  value: string;
  userId: string;
  source: BCMSColorSource;
}

export const BCMSColorFSDBShema: ObjectSchema = {
  ...FSDBEntitySchema,
  cid: {
    __type: 'string',
    __required: true,
  },
  label: {
    __type: 'string',
    __required: true,
  },
  name: {
    __type: 'string',
    __required: true,
  },
  value: {
    __type: 'string',
    __required: true,
  },
  userId: {
    __type: 'string',
    __required: true,
  },
  source: {
    __type: 'object',
    __required: true,
    __child: BCMSColorSourceSchema,
  },
};

export const BCMSColorMongoDBSchema = new Schema({
  ...MongoDBEntitySchemaString,
  cid: {
    type: String,
    required: true,
  },
  label: {
    type: String,
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  value: {
    type: String,
    required: true,
  },
  userId: {
    type: String,
    required: true,
  },
  source: {
    type: BCMSColorSourceMongoDBSchema,
    required: true,
  },
});
