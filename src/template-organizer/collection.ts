import { createGraphqlCollection } from '@becomes/purple-cheetah-mod-graphql';
import { BCMSTemplateOrganizerCreateDataInput } from './inputs';
import { BCMSTemplateOrganizerObject } from './objects';
import { BCMSTemplateOrganizerCreateResolver } from './resolvers';

export const BCMSTemplateOrganizerCollection = createGraphqlCollection({
  name: 'template_organizer',
  objects: [BCMSTemplateOrganizerObject],
  inputs: [BCMSTemplateOrganizerCreateDataInput],
  resolvers: [BCMSTemplateOrganizerCreateResolver],
});
