import { CacheHandler } from '../handler';
import { FSUser, User, IUser, UserRepo } from '../../user';

export class UserCacheHandler extends CacheHandler<FSUser, User, IUser> {
  constructor() {
    super(
      UserRepo,
      ['findByEmail', 'findByRefreshToken', 'count'],
      //   {
      //   findByEmail: {
      //     list: [],
      //     open: false,
      //   },
      //   findByRefreshToken: {
      //     list: [],
      //     open: false,
      //   },
      //   count: {
      //     list: [],
      //     open: false,
      //   },
      // }
    );
  }

  async findByEmail(email: string): Promise<FSUser | User> {
    return (await this.queueable.exec(
      'findByEmail',
      'free_one_by_one',
      async () => {
        await this.checkCountLatch();
        return this.cache.find((e) => e.email === email);
      },
    )) as User | FSUser;
  }

  async findByRefreshToken(rt: string): Promise<User | FSUser> {
    return (await this.queueable.exec(
      'findByRefreshToken',
      'free_one_by_one',
      async () => {
        await this.checkCountLatch();
        return this.cache.find((e) =>
          e.refreshTokens.find((t) => t.value === rt) ? true : false,
        );
      },
    )) as User | FSUser;
  }

  async count(): Promise<number> {
    await this.queueable.exec('count', 'first_done_free_all', async () => {
      await this.checkCountLatch();
      return true;
    });
    return this.cache.length;
  }
}
