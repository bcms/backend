import { createGraphqlObject } from '@becomes/purple-cheetah-mod-graphql';

export const BCMSPropDataValueColorPickerObject = createGraphqlObject({
  name: 'BCMSPropDataValueColorPicker',
  fields: {
    allowCustom: 'Boolean!',
    options: '[String!]!',
    selected: '[String!]!',
  },
});
