import { BCMSPropType } from '@bcms/types';
import { createGraphqlEnum } from '@becomes/purple-cheetah-mod-graphql';

export const BCMSPropTypeEnum = createGraphqlEnum({
  name: 'BCMSPropType',
  values: Object.keys(BCMSPropType),
});
