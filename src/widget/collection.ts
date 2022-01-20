import { createGraphqlCollection } from '@becomes/purple-cheetah-mod-graphql';
import { BCMSWidgetCreateDataInput } from './inputs';
import { BCMSWidgetObject } from './objects';
import { BCMSWidgetCreateResolver } from './resolvers';

export const BCMSWidgetCollection = createGraphqlCollection({
  name: 'widget',
  inputs: [BCMSWidgetCreateDataInput],
  objects: [BCMSWidgetObject],
  resolvers: [BCMSWidgetCreateResolver],
});
