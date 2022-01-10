import { createGraphqlInput } from '@becomes/purple-cheetah-mod-graphql';

export const BCMSColorUpdateDataInput = createGraphqlInput({
  name: 'BCMSColorUpdateData',
  fields: {
    _id: 'String!',
    label: 'String',
    value: 'String',
  },
});
