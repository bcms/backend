import { BCMSGqlDefaultEntityProps } from '@bcms/types';
import { createGraphqlObject } from '@becomes/purple-cheetah-mod-graphql';

export const BCMSApiKeyObject = createGraphqlObject({
  name: 'BCMSApiKey',
  fields: {
    ...BCMSGqlDefaultEntityProps,
    userId: 'String!',
    name: 'String!',
    desc: 'String!',
    blocked: 'Boolean!',
    secret: 'String!',
    access: 'BCMSApiKeyAccess!',
  },
});
