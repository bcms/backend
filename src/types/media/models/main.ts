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

// eslint-disable-next-line no-shadow
export enum BCMSMediaType {
  DIR = 'DIR',
  IMG = 'IMG',
  VID = 'VID',
  TXT = 'TXT',
  GIF = 'GIF',
  OTH = 'OTH',
  PDF = 'PDF',
  JS = 'JS',
  HTML = 'HTML',
  CSS = 'CSS',
  JAVA = 'JAVA',
}

export interface BCMSMediaProps {
  userId: string;
  type: BCMSMediaType;
  mimetype: string;
  size: number;
  name: string;
  isInRoot: boolean;
  hasChildren: boolean;
  parentId: string;
}

export type BCMSMediaFSDB = FSDBEntity & BCMSMediaProps;
export const BCMSMediaFSDBSchema: ObjectSchema = {
  ...FSDBEntitySchema,
  userId: {
    __type: 'string',
    __required: true,
  },
  mimetype: {
    __type: 'string',
    __required: true,
  },
  size: {
    __type: 'number',
    __required: true,
  },
  name: {
    __type: 'string',
    __required: true,
  },
  isInRoot: {
    __type: 'boolean',
    __required: true,
  },
  hasChildren: {
    __type: 'boolean',
    __required: true,
  },
  parentId: {
    __type: 'string',
    __required: true,
  },
};

export type BCMSMediaMongoDB = MongoDBEntity & BCMSMediaProps;
export const BCMSMediaMongoDBSchema = new Schema({
  ...MongoDBEntitySchema,
  userId: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    required: true,
  },
  mimetype: {
    type: String,
    required: true,
  },
  size: {
    type: Number,
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  isInRoot: {
    type: Boolean,
    required: true,
  },
  hasChildren: {
    type: Boolean,
    required: true,
  },
  parentId: String,
});

export type BCMSMedia = BCMSMediaFSDB | BCMSMediaMongoDB;
export type BCMSMediaCross = BCMSMediaFSDB & BCMSMediaMongoDB;
