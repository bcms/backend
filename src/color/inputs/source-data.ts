import { createGraphqlInput } from '@becomes/purple-cheetah-mod-graphql';

export const BCMSColorSourceInput = createGraphqlInput({
  name: 'BCMSColorSourceInput',
  fields: {
    id: 'String!',
    type: 'BCMSColorSourceType!',
  },
});
