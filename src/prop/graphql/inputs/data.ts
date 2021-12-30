import { createGraphqlInput } from '@becomes/purple-cheetah-mod-graphql';

export const BCMSPropDataInput = createGraphqlInput({
  name: 'BCMSPropDataInput',
  fields: {
    string: '[String!]',
    number: '[Float!]',
    color: 'BCMSPropColorPickerInput',
    boolean: '[Boolean!]',
    entryPointer: 'BCMSPropEntryPointerInput',
    enum: 'BCMSPropEnumerationInput',
    groupPointer: 'BCMSPropGroupPointerInput',
  },
});
