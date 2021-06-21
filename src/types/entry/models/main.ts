import type { BCMSPropContent } from '../../prop';
import type { ObjectSchema } from '@becomes/purple-cheetah/types';
import { Schema } from 'mongoose';
import {
  MongoDBEntity,
  MongoDBEntitySchema,
} from '@becomes/purple-cheetah-mod-mongodb/types';
import {
  FSDBEntity,
  FSDBEntitySchema,
} from '@becomes/purple-cheetah-mod-fsdb/types';

export interface BCMSEntryMeta {
  lng: string;
  props: BCMSPropContent[];
}
export const BCMSEntryMetaSchema: ObjectSchema = {
  lng: {
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

export interface BCMSEntryContent {
  lng: string;
  props: BCMSPropContent[];
}
export const BCMSEntryContentSchema: ObjectSchema = {
  lng: {
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

export interface BCMSEntryProps {
  templateId: string;
  userId: string;
  status?: string;
  meta: BCMSEntryMeta[];
  content: BCMSEntryContent[];
}

export type BCMSEntryMongoDB = MongoDBEntity & BCMSEntryProps;
export const BCMSEntryMongoDBSchema = new Schema({
  ...MongoDBEntitySchema,
  templateId: String,
  userId: String,
  status: String,
  meta: [Object],
  content: [Object],
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
      __content: BCMSEntryMetaSchema,
    },
  },
  content: {
    __type: 'array',
    __required: true,
    __child: {
      __type: 'object',
      __content: BCMSEntryContentSchema,
    },
  },
};

export type BCMSEntry = BCMSEntryFSDB & BCMSEntryMongoDB;
