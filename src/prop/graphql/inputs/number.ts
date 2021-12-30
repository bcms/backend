import { createGraphqlInput } from '@becomes/purple-cheetah-mod-graphql';

export const BCMSPropDataValueNumberInput = createGraphqlInput({
  name: 'BCMSPropNumberInput',
  fields: {
    value: '[Float!]!',
  },
});
