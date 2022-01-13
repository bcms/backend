import { createGraphqlInput } from '@becomes/purple-cheetah-mod-graphql';

export const BCMSTemplateOrganizerCreateDataInput = createGraphqlInput({
  name: 'BCMSTemplateOrganizerCreateData',
  fields: {
    label: 'String!',
    templateIds: '[String!]!',
    parentId: 'String',
  },
});
