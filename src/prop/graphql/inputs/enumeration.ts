import { createGraphqlInput } from '@becomes/purple-cheetah-mod-graphql';

export const BCMSPropDataValueEnumInput = createGraphqlInput({
  name: 'BCMSPropEnumerationInput',
  fields: {
    items: '[String!]!',
    selected: 'String',
  },
});
