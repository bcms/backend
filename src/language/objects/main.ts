import { BCMSGqlDefaultEntityProps } from '@bcms/types';
import { createGraphqlObject } from '@becomes/purple-cheetah-mod-graphql';

export const BCMSLanguageObject = createGraphqlObject({
  name: 'BCMSLanguage',
  fields: {
    ...BCMSGqlDefaultEntityProps,
    userId: 'String!',
    code: 'String!',
    name: 'String!',
    nativeName: 'String!',
    def: 'Boolean!',
  },
});
