import type { ObjectSchema } from '@becomes/purple-cheetah/types';
import { Schema } from 'mongoose';

export type BCMSColorSourceType = 'group' | 'widget' | 'template';

export interface BCMSColorSource {
  id: string;
  type: BCMSColorSourceType;
}

export const BCMSColorSourceSchema: ObjectSchema = {
  id: {
    __type: 'string',
    __required: true,
  },
  type: {
    __type: 'string',
    __required: true,
  },
};

export const BCMSColorSourceMongoDBSchema = new Schema({
  id: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    required: true,
  },
});
