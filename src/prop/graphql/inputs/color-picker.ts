import { createGraphqlInput } from '@becomes/purple-cheetah-mod-graphql';

export const BCMSPropDataValueColorPickerInput = createGraphqlInput({
  name: 'BCMSPropColorPickerInput',
  fields: {
    allowCustom: 'Boolean!',
    options: '[String!]!',
    selected: '[String!]!',
  },
});
