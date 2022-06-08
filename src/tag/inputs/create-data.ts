import { createGraphqlInput } from '@becomes/purple-cheetah-mod-graphql';

export const BCMSTagCreateDataInput = createGraphqlInput({
  name: 'BCMSTagCreateData',
  fields: {
    value: 'String!',
  },
});
