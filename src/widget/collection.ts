import { createGraphqlCollection } from '@becomes/purple-cheetah-mod-graphql';
import { BCMSWidgetCreateDataInput, BCMSWidgetUpdateDataInput } from './inputs';
import { BCMSWidgetObject } from './objects';
import {
  BCMSWidgetCountResolver,
  BCMSWidgetCreateResolver,
  BCMSWidgetGetAllResolver,
  BCMSWidgetGetByIdResolver,
  BCMSWidgetManyResolver,
  BCMSWidgetUpdateResolver,
} from './resolvers';

export const BCMSWidgetCollection = createGraphqlCollection({
  name: 'widget',
  inputs: [BCMSWidgetCreateDataInput, BCMSWidgetUpdateDataInput],
  objects: [BCMSWidgetObject],
  resolvers: [
    BCMSWidgetCountResolver,
    BCMSWidgetCreateResolver,
    BCMSWidgetGetAllResolver,
    BCMSWidgetManyResolver,
    BCMSWidgetGetByIdResolver,
    BCMSWidgetUpdateResolver,
  ],
});
