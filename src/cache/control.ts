import {
  UserCacheHandler,
  GroupCacheHandler,
  TemplateCacheHandler,
  WidgetCacheHandler,
  LanguageCacheHandler,
  ApiKeyCacheHandler,
  MediaCacheHandler,
  EntryCacheHandler,
} from './handlers';

export class CacheControl {
  static user: UserCacheHandler;
  static group: GroupCacheHandler;
  static template: TemplateCacheHandler;
  static widget: WidgetCacheHandler;
  static language: LanguageCacheHandler;
  static apiKey: ApiKeyCacheHandler;
  static media: MediaCacheHandler;
  static entry: EntryCacheHandler;

  static init() {
    this.user = new UserCacheHandler();
    this.group = new GroupCacheHandler();
    this.template = new TemplateCacheHandler();
    this.widget = new WidgetCacheHandler();
    this.language = new LanguageCacheHandler();
    this.apiKey = new ApiKeyCacheHandler();
    this.media = new MediaCacheHandler();
    this.entry = new EntryCacheHandler();
  }
}
