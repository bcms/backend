import { createGraphqlObject } from '@becomes/purple-cheetah-mod-graphql';

export const BCMSPropDataValueEnumObject = createGraphqlObject({
  name: 'BCMSPropDataValueEnumeration',
  fields: {
    items: '[String!]!',
    selected: 'String',
  },
});
