import { search } from '@banez/search';
import type { SearchSetItem } from '@banez/search/types';
import { BCMSRepo } from '@bcms/repo';
import type { BCMSUserCustomPool } from '@bcms/types';
import {
  createController,
  createControllerMethod,
} from '@becomes/purple-cheetah';
import { createJwtProtectionPreRequestHandler } from '@becomes/purple-cheetah-mod-jwt';
import {
  JWTPermissionName,
  JWTPreRequestHandlerResult,
  JWTRoleName,
} from '@becomes/purple-cheetah-mod-jwt/types';

type SearchResultType =
  | 'entry'
  | 'widget'
  | 'group'
  | 'template'
  | 'media'
  | 'user'
  | 'tag'
  | 'color'
  | 'apiKey';
interface GetAllSearchResultItem {
  /**
   * - Role ADMIN: all
   * - Role USER: entry, media, user, tag, color
   */
  type: SearchResultType;
  id: string;
  score: number;
  matches: number;
  positions: number[][];
}

export const BCMSSearchController = createController({
  name: 'Search controller',
  path: '/api/search',
  methods() {
    return {
      getAll: createControllerMethod<
        JWTPreRequestHandlerResult<BCMSUserCustomPool>,
        { items: GetAllSearchResultItem[] }
      >({
        path: '/all',
        type: 'get',
        preRequestHandler: createJwtProtectionPreRequestHandler(
          [JWTRoleName.ADMIN, JWTRoleName.USER],
          JWTPermissionName.READ,
        ),
        async handler({ request, accessToken }) {
          const term = request.query.term as string;
          const searchFor: SearchResultType[] = [
            'entry',
            'media',
            'user',
            'tag',
            'color',
          ];
          if (accessToken.payload.rls[0].name === JWTRoleName.ADMIN) {
            searchFor.push(
              ...([
                'widget',
                'group',
                'template',
                'apiKey',
              ] as SearchResultType[]),
            );
          }
          const searchSet: SearchSetItem[] = [];
          for (let i = 0; i < searchFor.length; i++) {
            const searchItem = searchFor[i];
            switch (searchItem) {
              case 'apiKey':
                {
                  const items = await BCMSRepo.apiKey.findAll();
                  searchSet.push(
                    ...items.map((item) => {
                      return {
                        id: `${searchItem}_${item._id}`,
                        data: [JSON.stringify({ ...item, secret: undefined })],
                      };
                    }),
                  );
                }
                break;
              case 'color':
                {
                  const items = await BCMSRepo.color.findAll();
                  searchSet.push(
                    ...items.map((item) => {
                      return {
                        id: `${searchItem}_${item._id}`,
                        data: [JSON.stringify(item)],
                      };
                    }),
                  );
                }
                break;
              // TODO: Add other types
            }
          }
          const searchResult = search({
            set: searchSet,
            searchTerm: term,
          });
          return {
            items: searchResult.items
              .filter((item) => item.score > 0)
              .map((item) => {
                const [type, id] = item.id.split('_');
                return {
                  id,
                  matches: item.matches,
                  positions: item.positions,
                  score: item.score,
                  type: type as SearchResultType,
                };
              }),
          };
        },
      }),
    };
  },
});
