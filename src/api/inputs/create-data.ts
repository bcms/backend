import { createGraphqlInput } from '@becomes/purple-cheetah-mod-graphql';

export const BCMSApiKeyCreateDataInput = createGraphqlInput({
  name: 'BCMSApiKeyCreateData',
  fields: {
    name: 'String!',
    desc: 'String!',
    blocked: 'Boolean!',
    access: 'BCMSApiKeyAccessData!',
  },
});
