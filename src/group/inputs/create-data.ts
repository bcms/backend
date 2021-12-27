import { createGraphqlInput } from '@becomes/purple-cheetah-mod-graphql';

export const BCMSGroupCreateDataInput = createGraphqlInput({
  name: 'BCMSGroupCreateData',
  fields: {
    label: 'String!',
    desc: 'String!',
  },
});
