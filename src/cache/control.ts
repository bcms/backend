import {
  UserCacheHandler,
  GroupCacheHandler,
  TemplateCacheHandler,
  WidgetCacheHandler,
} from './handlers';

export class CacheControl {
  public static user: UserCacheHandler;
  public static group: GroupCacheHandler;
  public static template: TemplateCacheHandler;
  public static widget: WidgetCacheHandler;

  public static init() {
    this.user = new UserCacheHandler();
    this.group = new GroupCacheHandler();
    this.template = new TemplateCacheHandler();
    this.widget = new WidgetCacheHandler();
  }
}
