import { search } from '@banez/search';
import type { SearchResultItem, SearchSetItem } from '@banez/search/types';
import { BCMSRepo } from '@bcms/repo';
import type {
  BCMSUserCustomPool,
  BCMSGetAllSearchResultItem,
  BCMSSearchResultType,
} from '@bcms/types';
import { BCMSRouteProtection } from '@bcms/util';
import {
  createController,
  createControllerMethod,
} from '@becomes/purple-cheetah';
import {
  JWTPermissionName,
  JWTPreRequestHandlerResult,
  JWTRoleName,
} from '@becomes/purple-cheetah-mod-jwt/types';

export const BCMSSearchController = createController({
  name: 'Search controller',
  path: '/api/search',
  methods() {
    return {
      getAll: createControllerMethod<
        JWTPreRequestHandlerResult<BCMSUserCustomPool>,
        { items: BCMSGetAllSearchResultItem[] }
      >({
        path: '/all',
        type: 'get',
        preRequestHandler: BCMSRouteProtection.createJwtPreRequestHandler(
          [JWTRoleName.ADMIN, JWTRoleName.USER],
          JWTPermissionName.READ,
        ),
        async handler({ request, accessToken }) {
          const term = request.query.term as string;
          if (!term || term.length < 3) {
            return {
              items: [],
            };
          }
          const searchFor: BCMSSearchResultType[] = [
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
              ] as BCMSSearchResultType[]),
            );
          }
          const searchResults: SearchResultItem[] = [];
          for (let i = 0; i < searchFor.length; i++) {
            const searchItem = searchFor[i];
            switch (searchItem) {
              case 'apiKey':
                {
                  const items = await BCMSRepo.apiKey.findAll();
                  searchResults.push(
                    ...search({
                      set: items.map((item) => {
                        return {
                          id: `${searchItem}_${item._id}`,
                          data: [
                            JSON.stringify({ ...item, secret: undefined }),
                          ],
                        };
                      }),
                      searchTerm: term,
                    }).items,
                  );
                }
                break;
              case 'color':
                {
                  const items = await BCMSRepo.color.findAll();
                  searchResults.push(
                    ...search({
                      set: items.map((item) => {
                        return {
                          id: `${searchItem}_${item._id}`,
                          data: [JSON.stringify(item)],
                        };
                      }),
                      searchTerm: term,
                    }).items,
                  );
                }
                break;
              case 'group':
                {
                  const items = await BCMSRepo.group.findAll();
                  searchResults.push(
                    ...search({
                      set: items.map((item) => {
                        return {
                          id: `${searchItem}_${item._id}`,
                          data: [JSON.stringify(item)],
                        };
                      }),
                      searchTerm: term,
                    }).items,
                  );
                }
                break;
              case 'tag':
                {
                  const items = await BCMSRepo.tag.findAll();
                  searchResults.push(
                    ...search({
                      set: items.map((item) => {
                        return {
                          id: `${searchItem}_${item._id}`,
                          data: [JSON.stringify(item)],
                        };
                      }),
                      searchTerm: term,
                    }).items,
                  );
                }
                break;
              case 'user':
                {
                  const items = await BCMSRepo.user.findAll();
                  searchResults.push(
                    ...search({
                      set: items.map((item) => {
                        return {
                          id: `${searchItem}_${item._id}`,
                          data: [
                            JSON.stringify({ ...item, password: undefined }),
                          ],
                        };
                      }),
                      searchTerm: term,
                    }).items,
                  );
                }
                break;
              case 'media':
                {
                  const items = await BCMSRepo.media.findAll();
                  searchResults.push(
                    ...search({
                      set: items.map((item) => {
                        return {
                          id: `${searchItem}_${item._id}`,
                          data: [JSON.stringify(item)],
                        };
                      }),
                      searchTerm: term,
                    }).items,
                  );
                }
                break;
              case 'template':
                {
                  const items = await BCMSRepo.template.findAll();
                  searchResults.push(
                    ...search({
                      set: items.map((item) => {
                        return {
                          id: `${searchItem}_${item._id}`,
                          data: [JSON.stringify(item)],
                        };
                      }),
                      searchTerm: term,
                    }).items,
                  );
                }
                break;
              case 'widget':
                {
                  const items = await BCMSRepo.widget.findAll();
                  searchResults.push(
                    ...search({
                      set: items.map((item) => {
                        return {
                          id: `${searchItem}_${item._id}`,
                          data: [JSON.stringify(item)],
                        };
                      }),
                      searchTerm: term,
                    }).items,
                  );
                }
                break;
              case 'entry':
                {
                  const items = await BCMSRepo.entry.findAll();
                  const searchSet: SearchSetItem[] = [];
                  for (let j = 0; j < items.length; j++) {
                    const item = items[j];
                    searchSet.push({
                      id: `${searchItem}_${item._id}_${item.templateId}`,
                      data: [
                        JSON.stringify(item.meta),
                        item.content
                          .map((content) => {
                            return content.plainText;
                          })
                          .join('\n\n'),
                      ],
                    });
                  }
                  searchResults.push(
                    ...search({
                      set: searchSet,
                      searchTerm: term,
                    }).items,
                  );
                }
                break;
            }
          }
          return {
            items: searchResults
              .filter((item) => item.score > 0)
              .sort((a, b) => (a.score > b.score ? -1 : 1))
              .map((item) => {
                const [_type, id, templateId] = item.id.split('_');
                const type = _type as BCMSSearchResultType;
                return {
                  id,
                  templateId,
                  matches: item.matches,
                  positions: item.positions,
                  score: item.score,
                  type: type as BCMSSearchResultType,
                };
              }),
          };
        },
      }),
    };
  },
});
