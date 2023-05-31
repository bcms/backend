import type { DocObject, DocSecurityItem } from '@becomes/purple-cheetah/types';
import {
  BCMSApiKeyAccessFSDBSchema,
  BCMSApiKeyFSDBSchema,
  BCMSProtectedUserSchema,
} from './types';
import { createDocObject } from '@becomes/purple-cheetah';

export const BCMSDocComponentSchemas = {
  BCMSProtectedUser: BCMSProtectedUserSchema,
  BCMSApiKeyAccess: BCMSApiKeyAccessFSDBSchema,
  BCMSApiKey: BCMSApiKeyFSDBSchema,
};

export type BCMSDocComponents = typeof BCMSDocComponentSchemas;

export const BCMSDocSecuritySchemas: {
  AccessToken: DocSecurityItem;
  RefreshToken: DocSecurityItem;
  ApiKey: DocSecurityItem;
} = {
  AccessToken: {
    inputNames: ['accessToken'],
    handler: async (inputs, res) => {
      console.log({ inputs, res });
    },
  },
  RefreshToken: {
    inputNames: ['refreshToken'],
    handler: async (inputs, res) => {
      console.log({ inputs, res });
    },
  },
  ApiKey: {
    inputNames: ['id', 'secret'],
    handler: async (inputs, res) => {
      console.log({ inputs, res });
    },
  },
};

export type BCMSDocSecurity = typeof BCMSDocSecuritySchemas;

export function bcmsCreateDocObject(
  data: DocObject<BCMSDocComponents, BCMSDocSecurity>,
): DocObject {
  return createDocObject(data);
}
