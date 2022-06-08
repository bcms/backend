import { createGraphqlCollection } from '@becomes/purple-cheetah-mod-graphql';
import { BCMSMediaTypeEnum } from './enums';
import {
  BCMSMediaCreateDirDataInput,
  BCMSMediaDuplicateDataInput,
  BCMSMediaMoveDataInput,
  BCMSMediaUpdateDataInput,
} from './inputs';
import { BCMSMediaAggregateObject, BCMSMediaObject } from './objects';
import {
  BCMSMediaCountResolver,
  BCMSMediaCreateDirResolver,
  BCMSMediaDeleteResolver,
  BCMSMediaDuplicateResolver,
  BCMSMediaGetAllAggregatedResolver,
  BCMSMediaGetAllByParentIdResolver,
  BCMSMediaGetAllResolver,
  BCMSMediaGetByIdAggregatedResolver,
  BCMSMediaGetByIdResolver,
  BCMSMediaGetManyResolver,
  BCMSMediaMoveResolver,
  BCMSMediaUpdateResolver,
} from './resolvers';

export const BCMSMediaCollection = createGraphqlCollection({
  name: 'media',
  enums: [BCMSMediaTypeEnum],
  inputs: [
    BCMSMediaCreateDirDataInput,
    BCMSMediaDuplicateDataInput,
    BCMSMediaMoveDataInput,
    BCMSMediaUpdateDataInput,
  ],
  objects: [BCMSMediaObject, BCMSMediaAggregateObject],
  resolvers: [
    BCMSMediaCountResolver,
    BCMSMediaCreateDirResolver,
    BCMSMediaDeleteResolver,
    BCMSMediaDuplicateResolver,
    BCMSMediaGetAllAggregatedResolver,
    BCMSMediaGetAllByParentIdResolver,
    BCMSMediaGetAllResolver,
    BCMSMediaGetManyResolver,
    BCMSMediaGetByIdAggregatedResolver,
    BCMSMediaGetByIdResolver,
    BCMSMediaMoveResolver,
    BCMSMediaUpdateResolver,
  ],
});
