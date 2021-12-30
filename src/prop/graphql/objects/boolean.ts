import { createGraphqlObject } from '@becomes/purple-cheetah-mod-graphql';

export const BCMSPropDataValueBooleanObject = createGraphqlObject({
  name: 'BCMSPropDataValueBoolean',
  fields: {
    boolean: '[Boolean!]!',
  },
});
