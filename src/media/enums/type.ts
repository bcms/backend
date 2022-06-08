import { BCMSMediaType } from '@bcms/types';
import { createGraphqlEnum } from '@becomes/purple-cheetah-mod-graphql';

export const BCMSMediaTypeEnum = createGraphqlEnum({
  name: 'BCMSMediaType',
  values: Object.keys(BCMSMediaType),
});
