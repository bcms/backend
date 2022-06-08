import { createGraphqlInput } from '@becomes/purple-cheetah-mod-graphql';

export const BCMSMediaMoveDataInput = createGraphqlInput({
  name: 'BCMSMediaMoveData',
  fields: {
    _id: 'String!',
    moveTo: 'String!',
  },
});
