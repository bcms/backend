import { BCMSGqlDefaultEntityProps } from '@bcms/types';
import { createGraphqlObject } from '@becomes/purple-cheetah-mod-graphql';

export const BCMSStatusObject = createGraphqlObject({
  name: 'BCMSStatus',
  fields: {
    ...BCMSGqlDefaultEntityProps,
    label: 'String!',
    name: 'String!',
    color: 'String!',
  },
});
