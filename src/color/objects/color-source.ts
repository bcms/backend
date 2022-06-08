import { createGraphqlObject } from '@becomes/purple-cheetah-mod-graphql';

export const BCMSColorSourceObject = createGraphqlObject({
  name: 'BCMSColorSource',
  fields: {
    id: 'String!',
    type: 'BCMSColorSourceType!',
  },
});
