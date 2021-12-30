import { BCMSGqlDefaultEntityProps } from '@bcms/types';
import { createGraphqlObject } from '@becomes/purple-cheetah-mod-graphql';

export const BCMSGroupLiteObject = createGraphqlObject({
  name: 'BCMSGroupLite',
  fields: {
    ...BCMSGqlDefaultEntityProps,
    cid: 'String!',
    name: 'String!',
    label: 'String!',
    desc: 'String!',
    propsCount: 'Float!',
  },
});
