import { createGraphqlInput } from '@becomes/purple-cheetah-mod-graphql';

export const BCMSTemplateUpdateDataInput = createGraphqlInput({
  name: 'BCMSTemplateUpdateData',
  fields: {
    _id: 'String!',
    label: 'String',
    desc: 'String',
    singleEntry: 'Boolean',
    propChanges: '[BCMSPropChange!]',
  },
});
