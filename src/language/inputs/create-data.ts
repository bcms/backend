import { createGraphqlInput } from '@becomes/purple-cheetah-mod-graphql';

export const BCMSLanguageCreateDataInput = createGraphqlInput({
  name: 'BCMSLanguageAddData',
  fields: {
    code: 'String!',
    name: 'String!',
    nativeName: 'String!',
  },
});
