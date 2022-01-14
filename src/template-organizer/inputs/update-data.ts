import { createGraphqlInput } from '@becomes/purple-cheetah-mod-graphql';

export const BCMSTemplateOrganizerUpdateDataInput = createGraphqlInput({
  name: 'BCMSTemplateOrganizerUpdateData',
  fields: {
    _id: 'String!',
    parentId: 'String',
    label: 'String',
    templateIds: '[String!]',
  },
});
