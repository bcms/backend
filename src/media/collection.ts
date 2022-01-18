import { createGraphqlCollection } from '@becomes/purple-cheetah-mod-graphql';
import { BCMSMediaTypeEnum } from './enums';
import {
  BCMSMediaCreateDirDataInput,
  BCMSMediaDuplicateDataInput,
  BCMSMediaUpdateDataInput,
} from './inputs';
import { BCMSMediaAggregateObject, BCMSMediaObject } from './objects';
import {
  BCMSMediaCountResolver,
  BCMSMediaCreateDirResolver,
  BCMSMediaDuplicateResolver,
  BCMSMediaGetAllAggregatedResolver,
  BCMSMediaGetAllByParentIdResolver,
  BCMSMediaGetAllResolver,
  BCMSMediaGetByIdAggregatedResolver,
  BCMSMediaGetByIdResolver,
  BCMSMediaGetManyResolver,
  BCMSMediaUpdateResolver,
} from './resolvers';

export const BCMSMediaCollection = createGraphqlCollection({
  name: 'media',
  enums: [BCMSMediaTypeEnum],
  inputs: [
    BCMSMediaCreateDirDataInput,
    BCMSMediaDuplicateDataInput,
    BCMSMediaUpdateDataInput,
  ],
  objects: [BCMSMediaObject, BCMSMediaAggregateObject],
  resolvers: [
    BCMSMediaCountResolver,
    BCMSMediaCreateDirResolver,
    BCMSMediaDuplicateResolver,
    BCMSMediaGetAllAggregatedResolver,
    BCMSMediaGetAllByParentIdResolver,
    BCMSMediaGetAllResolver,
    BCMSMediaGetManyResolver,
    BCMSMediaGetByIdAggregatedResolver,
    BCMSMediaGetByIdResolver,
    BCMSMediaUpdateResolver,
  ],
});
