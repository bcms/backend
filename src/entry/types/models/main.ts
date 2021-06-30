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
import type { BCMSPropValue } from '../../../types';

export interface BCMSEntryProps {
  templateId: string;
  userId: string;
  status?: string;
  meta: BCMSEntryMeta[];
}

export interface BCMSEntryMeta {
  lng: string;
  props: BCMSPropValue[];
}
export const BCMSEntryMetaFSDBSchema: ObjectSchema = {
  lng: {
    __type: 'string',
    __required: true,
  },
  props: {
    __type: 'array',
    __required: true,
    __child: {
      __type: 'object',
      __content: {
        _id: {
          __type: 'string',
          __required: true,
        },
      },
    },
  },
};
export const BCMSEntryMetaMongoDBSchema = new Schema({
  lng: {
    type: String,
    required: true,
  },
  props: {
    type: [Object],
    required: true,
  },
});

export type BCMSEntryFSDB = FSDBEntity & BCMSEntryProps;
export const BCMSEntryFSDBSchema: ObjectSchema = {
  ...FSDBEntitySchema,
  templateId: {
    __type: 'string',
    __required: true,
  },
  userId: {
    __type: 'string',
    __required: true,
  },
  status: {
    __type: 'string',
    __required: false,
  },
  meta: {
    __type: 'array',
    __required: true,
    __child: {
      __type: 'object',
      __content: BCMSEntryMetaFSDBSchema,
    },
  },
};

export type BCMSEntryMongoDB = MongoDBEntity & BCMSEntryProps;
export const BCMSEntryMongoDBSchema = new Schema({
  ...MongoDBEntitySchema,
  templateId: {
    type: String,
    required: true,
  },
  userId: {
    type: String,
    required: true,
  },
  status: String,
  meta: {
    type: [BCMSEntryMetaMongoDBSchema],
    required: true,
  },
});

export type BCMSEntry = BCMSEntryMongoDB | BCMSEntryFSDB;
