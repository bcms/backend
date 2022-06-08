import { createGraphqlInput } from '@becomes/purple-cheetah-mod-graphql';

export const BCMSPropDataValueStringInput = createGraphqlInput({
  name: 'BCMSPropStringInput',
  fields: {
    value: '[String]',
  },
});
