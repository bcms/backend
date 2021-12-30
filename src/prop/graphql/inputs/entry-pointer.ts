import { createGraphqlInput } from '@becomes/purple-cheetah-mod-graphql';

export const BCMSPropDataValueEntryPointerInput = createGraphqlInput({
  name: 'BCMSPropEntryPointerInput',
  fields: {
    templateId: 'String!',
    entryIds: '[String!]!',
    displayProp: 'String!',
  },
});
