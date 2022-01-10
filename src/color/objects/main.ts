import { BCMSGqlDefaultEntityProps } from '@bcms/types';
import { createGraphqlObject } from '@becomes/purple-cheetah-mod-graphql';

export const BCMSColorObject = createGraphqlObject({
  name: 'BCMSColor',
  fields: {
    ...BCMSGqlDefaultEntityProps,
    cid: 'String!',
    label: 'String!',
    name: 'String!',
    value: 'String!',
    userId: 'String!',
    source: 'BCMSColorSource!',
  },
});
