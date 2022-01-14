import { createGraphqlInput } from '@becomes/purple-cheetah-mod-graphql';

export const BCMSStatusUpdateDataInput = createGraphqlInput({
  name: 'BCMSStatusUpdateData',
  fields: {
    _id: 'String!',
    label: 'String',
    color: 'String',
  },
});
