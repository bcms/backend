import { BCMSGqlDefaultEntityProps } from '@bcms/types';
import { createGraphqlObject } from '@becomes/purple-cheetah-mod-graphql';

export const BCMSTemplateObject = createGraphqlObject({
  name: 'BCMSTemplate',
  fields: {
    ...BCMSGqlDefaultEntityProps,
    cid: 'String!',
    name: 'String!',
    label: 'String!',
    desc: 'String!',
    userId: 'String!',
    singleEntry: 'Boolean!',
    props: '[BCMSProp!]!',
  },
});
