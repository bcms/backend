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

export interface BCMSTemplateOrganizerProps {
  parentId?: string;
  label: string;
  name: string;
  templateIds: string[];
}

export type BCMSTemplateOrganizerFSDB = FSDBEntity & BCMSTemplateOrganizerProps;
export const BCMSTemplateOrganizerFSDBSchema: ObjectSchema = {
  ...FSDBEntitySchema,
  parentId: {
    __type: 'string',
    __required: false,
  },
  label: {
    __type: 'string',
    __required: true,
  },
  name: {
    __type: 'string',
    __required: true,
  },
  templateIds: {
    __type: 'array',
    __required: true,
    __child: {
      __type: 'string',
    },
  },
};

export type BCMSTemplateOrganizerMongoDB = MongoDBEntity &
  BCMSTemplateOrganizerProps;
export const BCMSTemplateOrganizerMongoDBSchema = new Schema({
  ...MongoDBEntitySchema,
  parentId: String,
  label: {
    type: String,
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  templateIds: {
    type: [String],
    required: true,
  },
});

export type BCMSTemplateOrganizer =
  | BCMSTemplateOrganizerMongoDB
  | BCMSTemplateOrganizerFSDB;
