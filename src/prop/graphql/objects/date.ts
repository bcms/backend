import { createGraphqlObject } from '@becomes/purple-cheetah-mod-graphql';

export const BCMSPropDataValueDateObject = createGraphqlObject({
  name: 'BCMSPropDataValueDate',
  fields: {
    date: '[Float!]!',
  },
});
