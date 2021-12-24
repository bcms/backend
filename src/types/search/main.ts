export type SearchResultType =
  | 'entry'
  | 'widget'
  | 'group'
  | 'template'
  | 'media'
  | 'user'
  | 'tag'
  | 'color'
  | 'apiKey';
export interface GetAllSearchResultItem {
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
