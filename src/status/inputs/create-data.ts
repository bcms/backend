import { createGraphqlInput } from '@becomes/purple-cheetah-mod-graphql';

export const BCMSStatusCreateDataInput = createGraphqlInput({
  name: 'BCMSStatusCreateData',
  fields: {
    label: 'String!',
    color: 'String',
  },
});
