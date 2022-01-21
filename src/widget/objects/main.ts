import { BCMSGqlDefaultEntityProps } from '@bcms/types';
import { createGraphqlObject } from '@becomes/purple-cheetah-mod-graphql';

export const BCMSWidgetObject = createGraphqlObject({
  name: 'BCMSWidget',
  fields: {
    ...BCMSGqlDefaultEntityProps,
    cid: 'String!',
    name: 'String!',
    label: 'String!',
    desc: 'String!',
    previewImage: 'String!',
    previewScript: 'String!',
    previewStyle: 'String!',
    props: '[BCMSProp!]!',
  },
});
