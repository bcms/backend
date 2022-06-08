import { createGraphqlInput } from '@becomes/purple-cheetah-mod-graphql';

export const BCMSMediaUpdateDataInput = createGraphqlInput({
  name: 'BCMSMediaUpdateData',
  fields: {
    _id: 'String!',
    altText: 'String',
    caption: 'String',
    name: 'String',
  },
});
