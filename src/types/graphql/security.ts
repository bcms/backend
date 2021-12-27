import type { GraphqlFields } from '@becomes/purple-cheetah-mod-graphql/types';

export interface BCMSGraphqlSecurityArgsType {
  accessToken: string;
}

export const BCMSGraphqlSecurityArgs: GraphqlFields = {
  accessToken: 'String!',
};
