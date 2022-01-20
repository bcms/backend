import { createGraphqlCollection } from '@becomes/purple-cheetah-mod-graphql';
import { BCMSWidgetCreateDataInput } from './inputs';
import { BCMSWidgetObject } from './objects';
import {
  BCMSWidgetCountResolver,
  BCMSWidgetCreateResolver,
  BCMSWidgetGetAllResolver,
  BCMSWidgetGetByIdResolver,
  BCMSWidgetManyResolver,
} from './resolvers';

export const BCMSWidgetCollection = createGraphqlCollection({
  name: 'widget',
  inputs: [BCMSWidgetCreateDataInput],
  objects: [BCMSWidgetObject],
  resolvers: [
    BCMSWidgetCountResolver,
    BCMSWidgetCreateResolver,
    BCMSWidgetGetAllResolver,
    BCMSWidgetManyResolver,
    BCMSWidgetGetByIdResolver,
  ],
});
