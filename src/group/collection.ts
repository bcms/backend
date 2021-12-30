import {
  BCMSPropChangeAddInput,
  BCMSPropChangeInput,
  BCMSPropChangeTransformInput,
  BCMSPropChangeUpdateInput,
} from '@bcms/prop';
import { createGraphqlCollection } from '@becomes/purple-cheetah-mod-graphql';
import { BCMSGroupCreateDataInput, BCMSGroupUpdateDataInput } from './inputs';
import { BCMSGroupLiteObject, BCMSGroupObject } from './objects';
import {
  BCMSGroupGetAllResolver,
  BCMSGroupGetAllLiteResolver,
  BCMSGroupGetManyResolver,
  BCMSGroupGetByIdResolver,
  BCMSGroupCountResolver,
  BCMSGroupCreateResolver,
  BCMSGroupUpdateResolver,
  BCMSGroupDeleteResolver,
} from './resolvers';

export const BCMSGroupCollection = createGraphqlCollection({
  name: 'group',
  objects: [BCMSGroupObject, BCMSGroupLiteObject],
  inputs: [
    BCMSGroupCreateDataInput,
    BCMSGroupUpdateDataInput,
    BCMSPropChangeInput,
    BCMSPropChangeAddInput,
    BCMSPropChangeUpdateInput,
    BCMSPropChangeTransformInput,
  ],
  resolvers: [
    BCMSGroupGetAllResolver,
    BCMSGroupGetAllLiteResolver,
    BCMSGroupGetManyResolver,
    BCMSGroupGetByIdResolver,
    BCMSGroupCountResolver,
    BCMSGroupCreateResolver,
    BCMSGroupUpdateResolver,
    BCMSGroupDeleteResolver,
  ],
});
