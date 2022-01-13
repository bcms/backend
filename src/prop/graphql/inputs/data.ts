import { createGraphqlInput } from '@becomes/purple-cheetah-mod-graphql';

export const BCMSPropDataInput = createGraphqlInput({
  name: 'BCMSPropDataInput',
  fields: {
    string: '[String!]',
    number: '[Float!]',
    colorPicker: 'BCMSPropColorPickerInput',
    boolean: '[Boolean!]',
    entryPointer: 'BCMSPropEntryPointerInput',
    enum: 'BCMSPropEnumerationInput',
    groupPointer: 'BCMSPropGroupPointerInput',
    media: '[String!]',
    date: '[Float!]',
    tag: '[String!]',
  },
});
