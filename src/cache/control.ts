import { UserCacheHandler, GroupCacheHandler } from './handlers';

export class CacheControl {
  public static user: UserCacheHandler;
  public static group: GroupCacheHandler;

  public static init() {
    this.user = new UserCacheHandler();
    this.group = new GroupCacheHandler();
  }
}
