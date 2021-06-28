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

export interface BCMSLanguageProps {
  userId: string;
  code: string;
  name: string;
  nativeName: string;
  def: boolean;
}

export type BCMSLanguageFSDB = FSDBEntity & BCMSLanguageProps;
export const BCMSLanguageFSDBSchema: ObjectSchema = {
  ...FSDBEntitySchema,
  userId: {
    __type: 'string',
    __required: true,
  },
  code: {
    __type: 'string',
    __required: true,
  },
  name: {
    __type: 'string',
    __required: true,
  },
  nativeName: {
    __type: 'string',
    __required: true,
  },
  def: {
    __type: 'boolean',
    __required: true,
  },
};

export type BCMSLanguageMongoDB = MongoDBEntity & BCMSLanguageProps;
export const BCMSLanguageMongoDBSchema = new Schema({
  ...MongoDBEntitySchema,
  userId: {
    type: String,
    required: true,
  },
  code: {
    type: String,
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  nativeName: {
    type: String,
    required: true,
  },
  def: {
    type: Boolean,
    required: true,
  },
});

export type BCMSLanguage = BCMSLanguageFSDB | BCMSLanguageMongoDB;
