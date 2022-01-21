import { createGraphqlInput } from '@becomes/purple-cheetah-mod-graphql';

export const BCMSWidgetUpdateDataInput = createGraphqlInput({
  name: 'BCMSWidgetUpdateData',
  fields: {
    _id: 'String!',
    label: 'String',
    desc: 'String',
    previewImage: 'String',
    previewScript: 'String',
    previewStyle: 'String',
    propChanges: '[BCMSPropChange!]',
  },
});
