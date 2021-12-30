import { createGraphqlInput } from '@becomes/purple-cheetah-mod-graphql';

export const BCMSGroupUpdateDataInput = createGraphqlInput({
  name: 'BCMSGroupUpdateData',
  fields: {
    _id: 'String!',
    label: 'String',
    desc: 'String',
    propChanges: '[BCMSPropChange!]',
  },
});
