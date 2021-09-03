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

export interface BCMSTemplateProps {
  cid: string;
  name: string;
  label: string;
  desc: string;
  userId: string;
  singleEntry: boolean;
  props: BCMSProp[];
}

export type BCMSTemplateFSDB = FSDBEntity & BCMSTemplateProps;
export const BCMSTemplateFSDBSchema: ObjectSchema = {
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
  userId: {
    __type: 'string',
    __required: true,
  },
  singleEntry: {
    __type: 'boolean',
    __required: true,
  },
};

export type BCMSTemplateMongoDB = MongoDBEntity & BCMSTemplateProps;
export const BCMSTemplateMongoDBSchema = new Schema({
  ...MongoDBEntitySchema,
  cid: {
    type: String,
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  label: {
    type: String,
    required: true,
  },
  desc: {
    type: String,
    required: true,
  },
  userId: {
    type: String,
    required: true,
  },
  singleEntry: {
    type: Boolean,
    required: true,
  },
  props: {
    type: [Object],
    required: true,
  },
});

export type BCMSTemplate = BCMSTemplateFSDB | BCMSTemplateMongoDB;
export type BCMSTemplateCross = BCMSTemplateFSDB & BCMSTemplateMongoDB;
