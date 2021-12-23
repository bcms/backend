export interface SearchResult {
  /**
   * - Role ADMIN: all
   * - Role USER: entry, media, user, tag, color
   */
  type:
    | 'entry'
    | 'widget'
    | 'group'
    | 'template'
    | 'media'
    | 'user'
    | 'tag'
    | 'color'
    | 'apiKey';
  id: string;
  score: number;
  matches: number;
  pointer: string;
}
