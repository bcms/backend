import { createGraphqlInput } from '@becomes/purple-cheetah-mod-graphql';

export const BCMSPropDataValueBooleanInput = createGraphqlInput({
  name: 'BCMSPropBooleanInput',
  fields: {
    value: '[Boolean!]!',
  },
});
