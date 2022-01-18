import { createGraphqlInput } from '@becomes/purple-cheetah-mod-graphql';

export const BCMSMediaDuplicateDataInput = createGraphqlInput({
  name: 'BCMSMediaDuplicateData',
  fields: {
    _id: 'String!',
    duplicateTo: 'String!',
  },
});
