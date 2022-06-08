import { createGraphqlInput } from '@becomes/purple-cheetah-mod-graphql';

export const BCMSPropChangeInput = createGraphqlInput({
  name: 'BCMSPropChange',
  fields: {
    add: 'BCMSPropChangeAdd',
    remove: 'String',
    update: 'BCMSPropChangeUpdate',
    transform: 'BCMSPropChangeTransform',
  },
});

export const BCMSPropChangeAddInput = createGraphqlInput({
  name: 'BCMSPropChangeAdd',
  fields: {
    label: 'String!',
    type: 'BCMSPropType!',
    required: 'Boolean!',
    array: 'Boolean!',
    defaultData: 'BCMSPropDataInput',
  },
});

export const BCMSPropChangeUpdateInput = createGraphqlInput({
  name: 'BCMSPropChangeUpdate',
  fields: {
    id: 'String!',
    label: 'String!',
    move: 'Float!',
    required: 'Boolean!',
    enumItems: '[String!]',
    colorData: 'BCMSPropColorPickerInput',
  },
});

export const BCMSPropChangeTransformInput = createGraphqlInput({
  name: 'BCMSPropChangeTransform',
  fields: {
    from: 'String!',
    to: 'BCMSPropType!',
  },
});
