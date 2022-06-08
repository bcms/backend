import { BCMSGqlDefaultEntityProps } from '@bcms/types';
import { createGraphqlObject } from '@becomes/purple-cheetah-mod-graphql';

export const BCMSTemplateOrganizerObject = createGraphqlObject({
  name: 'BCMSTemplateOrganizer',
  fields: {
    ...BCMSGqlDefaultEntityProps,
    parentId: 'String',
    label: 'String!',
    name: 'String!',
    templateIds: '[String!]!',
  },
});
