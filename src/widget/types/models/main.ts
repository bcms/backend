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
import type { BCMSProp } from '../../../types';

export interface BCMSWidgetProps {
  name: string;
  label: string;
  desc: string;
  previewImage: string;
  previewScript: string;
  previewStyle: string;
  props: BCMSProp[];
}

export type BCMSWidgetFSDB = FSDBEntity & BCMSWidgetProps;
export const BCMSWidgetFSDBSchema: ObjectSchema = {
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
  previewImage: {
    __type: 'string',
    __required: false,
  },
  previewScript: {
    __type: 'string',
    __required: false,
  },
  previewStyle: {
    __type: 'string',
    __required: false,
  },
};

export type BCMSWidgetMongoDB = MongoDBEntity & BCMSWidgetProps;
export const BCMSWidgetMongoDBSchema = new Schema({
  ...MongoDBEntitySchema,
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
  previewImage: {
    type: String,
    required: true,
  },
  previewScript: {
    type: String,
    required: true,
  },
  previewStyle: {
    type: String,
    required: true,
  },
});

export type BCMSWidget = BCMSWidgetFSDB | BCMSWidgetMongoDB;
