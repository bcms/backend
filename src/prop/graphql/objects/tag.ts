import { createGraphqlObject } from '@becomes/purple-cheetah-mod-graphql';

export const BCMSPropDataValueTagObject = createGraphqlObject({
  name: 'BCMSPropDataValueTag',
  fields: {
    tag: '[String!]!',
  },
});
