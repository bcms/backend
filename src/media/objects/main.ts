import { BCMSGqlDefaultEntityProps } from '@bcms/types';
import { createGraphqlObject } from '@becomes/purple-cheetah-mod-graphql';

export const BCMSMediaObject = createGraphqlObject({
  name: 'BCMSMedia',
  fields: {
    ...BCMSGqlDefaultEntityProps,
    userId: 'String!',
    type: 'BCMSMediaType!',
    mimetype: 'String!',
    size: 'Float!',
    name: 'String!',
    isInRoot: 'Boolean!',
    hasChildren: 'Boolean!',
    parentId: 'String!',
    altText: 'String!',
    caption: 'String!',
    width: 'Float!',
    height: 'Float!',
  },
});
