import { BCMSGqlDefaultEntityProps } from '@bcms/types';
import { createGraphqlObject } from '@becomes/purple-cheetah-mod-graphql';

export const BCMSTagObject = createGraphqlObject({
  name: 'BCMSTag',
  fields: {
    ...BCMSGqlDefaultEntityProps,
    value: 'String!',
    cid: 'String!',
  },
});
