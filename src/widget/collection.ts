import { createGraphqlCollection } from '@becomes/purple-cheetah-mod-graphql';
import { BCMSWidgetCreateDataInput, BCMSWidgetUpdateDataInput } from './inputs';
import { BCMSWidgetObject } from './objects';
import {
  BCMSWidgetCountResolver,
  BCMSWidgetCreateResolver,
  BCMSWidgetDeleteResolver,
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
    BCMSWidgetDeleteResolver,
    BCMSWidgetGetAllResolver,
    BCMSWidgetManyResolver,
    BCMSWidgetGetByIdResolver,
    BCMSWidgetUpdateResolver,
  ],
});
