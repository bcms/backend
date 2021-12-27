import { createGraphqlObject } from '@becomes/purple-cheetah-mod-graphql';

export const BCMSPropDataValueStringObject = createGraphqlObject({
  name: 'BCMSPropDataValueString',
  fields: {
    value: '[String!]!',
  },
});
