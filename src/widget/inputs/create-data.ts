import { createGraphqlInput } from '@becomes/purple-cheetah-mod-graphql';

export const BCMSWidgetCreateDataInput = createGraphqlInput({
  name: 'BCMSWidgetCreateData',
  fields: {
    label: 'String!',
    desc: 'String!',
    previewImage: 'String!',
    previewScript: 'String!',
    previewStyle: 'String!',
  },
});
