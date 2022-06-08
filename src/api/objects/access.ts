import { createGraphqlObject } from '@becomes/purple-cheetah-mod-graphql';

export const BCMSApiKeyAccessObject = createGraphqlObject({
  name: 'BCMSApiKeyAccess',
  fields: {
    templates: '[BCMSUserPolicyCRUDWithId!]!',
    functions: '[BCMSFunctionName!]!',
  },
});

export const BCMSUserPolicyCRUDObject = createGraphqlObject({
  name: 'BCMSUserPolicyCRUD',
  fields: {
    get: 'Boolean!',
    post: 'Boolean!',
    put: 'Boolean!',
    delete: 'Boolean!',
  },
});
export const BCMSUserPolicyCRUDWithIdObject = createGraphqlObject({
  name: 'BCMSUserPolicyCRUDWithId',
  fields: {
    get: 'Boolean!',
    post: 'Boolean!',
    put: 'Boolean!',
    delete: 'Boolean!',
    _id: 'String!',
  },
});
export const BCMSFunctionNameObject = createGraphqlObject({
  name: 'BCMSFunctionName',
  fields: {
    name: 'String!',
  },
});
