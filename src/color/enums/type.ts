import { createGraphqlEnum } from '@becomes/purple-cheetah-mod-graphql';

export const BCMSColorSourceTypeEnum = createGraphqlEnum({
  name: 'BCMSColorSourceType',
  values: ['group', 'widget', 'template'],
});
