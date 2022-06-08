import { createGraphqlInput } from '@becomes/purple-cheetah-mod-graphql';

export const BCMSTagUpdateDataInput = createGraphqlInput({
  name: 'BCMSTagUpdateData',
  fields: {
    _id: 'String!',
    value: 'String!',
  },
});
