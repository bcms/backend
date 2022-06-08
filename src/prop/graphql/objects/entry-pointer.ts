import { createGraphqlObject } from '@becomes/purple-cheetah-mod-graphql';

export const BCMSPropDataValueEntryPointerObject = createGraphqlObject({
  name: 'BCMSPropDataValueEntryPointer',
  fields: {
    templateId: 'String!',
    entryIds: 'String!',
    displayProp: 'String!',
  },
});
