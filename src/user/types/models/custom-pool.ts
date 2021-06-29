import type { ObjectSchema } from '@becomes/purple-cheetah/types';
import {
  BCMSUserPersonal,
  BCMSUserPersonalFSDBSchema,
  BCMSUserPersonalMongoDBSchema,
} from './personal';
import {
  BCMSUserAddress,
  BCMSUserAddressFSDBSchema,
  BCMSUserAddressMongoDBSchema,
} from './address';
import {
  BCMSUserPolicy,
  BCMSUserPolicyFSDBSchema,
  BCMSUserPolicyMongoDBSchema,
} from './policy';
import { Schema } from 'mongoose';

export interface BCMSUserCustomPool {
  personal: BCMSUserPersonal;
  address: BCMSUserAddress;
  policy: BCMSUserPolicy;
}

export const BCMSUserCustomPoolFSDBSchema: ObjectSchema = {
  personal: {
    __type: 'object',
    __required: true,
    __child: BCMSUserPersonalFSDBSchema,
  },
  address: {
    __type: 'object',
    __required: true,
    __child: BCMSUserAddressFSDBSchema,
  },
  policy: {
    __type: 'object',
    __required: true,
    __child: BCMSUserPolicyFSDBSchema,
  },
};

export const BCMSUserCustomPoolMongoDBSchema = new Schema({
  personal: {
    type: BCMSUserPersonalMongoDBSchema,
    required: true,
  },
  address: {
    type: BCMSUserAddressMongoDBSchema,
    required: true,
  },
  policy: {
    type: BCMSUserPolicyMongoDBSchema,
    required: true,
  },
});