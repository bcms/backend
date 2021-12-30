import { createGraphqlInput } from '@becomes/purple-cheetah-mod-graphql';

export const BCMSPropDataInput = createGraphqlInput({
  name: 'BCMSPropDataInput',
  fields: {
    string: 'BCMSPropStringInput',
    number: 'BCMSPropNumberInput',
    color: 'BCMSPropColorPickerInput',
    boolean: 'BCMSPropBooleanInput',
    entryPointer: 'BCMSPropEntryPointerInput',
    enum: 'BCMSPropEnumerationInput',
    groupPointer: 'BCMSPropGroupPointerInput',
    widget: 'BCMSPropWidgetInput',
  },
});
