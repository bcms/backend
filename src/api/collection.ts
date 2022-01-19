import { createGraphqlCollection } from '@becomes/purple-cheetah-mod-graphql';
import {
  BCMSApiKeyAccessDataInput,
  BCMSApiKeyCreateDataInput,
  BCMSFunctionNameDataInput,
  BCMSUserPolicyCRUDDataInput,
  BCMSUserPolicyCRUDWithIdDataInput,
} from './inputs';
import {
  BCMSApiKeyAccessObject,
  BCMSApiKeyObject,
  BCMSFunctionNameObject,
  BCMSUserPolicyCRUDObject,
  BCMSUserPolicyCRUDWithIdObject,
} from './objects';
import {
  BCMSApiKeyCountResolver,
  BCMSApiKeyCreateResolver,
  BCMSApiKeyGetAllResolver,
} from './resolvers';

export const BCMSApiKeyCollection = createGraphqlCollection({
  name: 'apiKey',
  objects: [
    BCMSApiKeyAccessObject,
    BCMSUserPolicyCRUDObject,
    BCMSApiKeyObject,
    BCMSUserPolicyCRUDWithIdObject,
    BCMSFunctionNameObject,
  ],
  enums: [],
  inputs: [
    BCMSApiKeyCreateDataInput,
    BCMSApiKeyAccessDataInput,
    BCMSUserPolicyCRUDDataInput,
    BCMSUserPolicyCRUDWithIdDataInput,
    BCMSFunctionNameDataInput,
  ],
  resolvers: [
    BCMSApiKeyCreateResolver,
    BCMSApiKeyCountResolver,
    BCMSApiKeyGetAllResolver,
  ],
});
