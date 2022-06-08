import { createGraphqlInput } from '@becomes/purple-cheetah-mod-graphql';

export const BCMSColorCreateDataInput = createGraphqlInput({
  name: 'BCMSColorCreateData',
  fields: {
    label: 'String!',
    value: 'String!',
    source: 'BCMSColorSourceInput!',
  },
});
