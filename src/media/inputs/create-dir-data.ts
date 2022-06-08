import { createGraphqlInput } from '@becomes/purple-cheetah-mod-graphql';

export const BCMSMediaCreateDirDataInput = createGraphqlInput({
  name: 'BCMSMediaCreateDirData',
  fields: {
    name: 'String!',
    parentId: 'String',
  },
});
