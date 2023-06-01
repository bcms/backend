import type {
  DocObject,
  DocSecurityItem,
  ObjectSchema,
} from '@becomes/purple-cheetah/types';
import {
  BCMSApiKeyAccessFSDBSchema,
  BCMSApiKeyAddDataSchema,
  BCMSApiKeyFSDBSchema,
  BCMSApiKeyUpdateDataSchema,
  BCMSProtectedUserSchema,
} from './types';
import { createDocObject } from '@becomes/purple-cheetah';

export const BCMSDocComponentSchemas = {
  BCMSProtectedUser: BCMSProtectedUserSchema,
  // API Key
  BCMSApiKeyAccess: BCMSApiKeyAccessFSDBSchema,
  BCMSApiKey: BCMSApiKeyFSDBSchema,
  BCMSApiKeyItem: {
    item: {
      __type: 'object',
      __required: true,
      __child: BCMSApiKeyFSDBSchema,
    },
  } as ObjectSchema,
  BCMSApiKeyItems: {
    items: {
      __type: 'array',
      __required: true,
      __child: {
        __type: 'object',
        __content: BCMSApiKeyFSDBSchema,
      },
    },
  } as ObjectSchema,
  BCMSApiKeyAddData: BCMSApiKeyAddDataSchema,
  BCMSApiKeyUpdateData: BCMSApiKeyUpdateDataSchema,
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
