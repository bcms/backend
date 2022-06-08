import { createGraphqlObject } from '@becomes/purple-cheetah-mod-graphql';

export const BCMSPropDataValueMediaObject = createGraphqlObject({
  name: 'BCMSPropDataValueMedia',
  fields: {
    media: '[String!]!',
  },
});
