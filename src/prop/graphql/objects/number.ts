import { createGraphqlObject } from '@becomes/purple-cheetah-mod-graphql';

export const BCMSPropDataValueNumberObject = createGraphqlObject({
  name: 'BCMSPropDataValueNumber',
  fields: {
    value: '[Float!]!',
  },
});
