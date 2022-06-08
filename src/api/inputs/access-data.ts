import { createGraphqlInput } from '@becomes/purple-cheetah-mod-graphql';

export const BCMSApiKeyAccessDataInput = createGraphqlInput({
  name: 'BCMSApiKeyAccessData',
  fields: {
    templates: '[BCMSUserPolicyCRUDWithIdData!]!',
    functions: '[BCMSFunctionNameData!]!',
  },
});

export const BCMSUserPolicyCRUDDataInput = createGraphqlInput({
  name: 'BCMSUserPolicyCRUDData',
  fields: {
    get: 'Boolean!',
    post: 'Boolean!',
    put: 'Boolean!',
    delete: 'Boolean!',
  },
});
export const BCMSUserPolicyCRUDWithIdDataInput = createGraphqlInput({
  name: 'BCMSUserPolicyCRUDWithIdData',
  fields: {
    get: 'Boolean!',
    post: 'Boolean!',
    put: 'Boolean!',
    delete: 'Boolean!',
    _id: 'String!',
  },
});
export const BCMSFunctionNameDataInput = createGraphqlInput({
  name: 'BCMSFunctionNameData',
  fields: {
    name: 'String!',
  },
});
