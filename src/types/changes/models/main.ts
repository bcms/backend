import {
  FSDBEntity,
  FSDBEntitySchema,
} from '@becomes/purple-cheetah-mod-fsdb/types';
import { MongoDBEntitySchemaString } from '@becomes/purple-cheetah-mod-mongodb/types';
import type { ObjectSchema } from '@becomes/purple-cheetah/types';
import { Schema } from 'mongoose';

export interface BCMSChange extends FSDBEntity {
  entry: number;
  group: number;
  color: number;
  language: number;
  media: number;
  status: number;
  tag: number;
  templates: number;
  widget: number;
}

export const BCMSChangeFSDBSchema: ObjectSchema = {
  ...FSDBEntitySchema,
  entry: {
    __type: 'number',
    __required: true,
  },
  group: {
    __type: 'number',
    __required: true,
  },
  color: {
    __type: 'number',
    __required: true,
  },
  language: {
    __type: 'number',
    __required: true,
  },
  media: {
    __type: 'number',
    __required: true,
  },
  status: {
    __type: 'number',
    __required: true,
  },
  tag: {
    __type: 'number',
    __required: true,
  },
  templates: {
    __type: 'number',
    __required: true,
  },
  widget: {
    __type: 'number',
    __required: true,
  },
};

export const BCMSChangeTimeMongoDBSchema = new Schema({
  ...MongoDBEntitySchemaString,
  entry: {
    type: String,
    required: true,
  },
  group: {
    type: String,
    required: true,
  },
  color: {
    type: String,
    required: true,
  },
  language: {
    type: String,
    required: true,
  },
  media: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    required: true,
  },
  tag: {
    type: String,
    required: true,
  },
  tempaltes: {
    type: String,
    required: true,
  },
  widget: {
    type: String,
    required: true,
  },
});
