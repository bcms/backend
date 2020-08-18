import { CacheHandler } from '../handler';
import { FSGroup, Group, IGroup, GroupRepo } from '../../group';

export class GroupCacheHandler extends CacheHandler<FSGroup, Group, IGroup> {
  constructor() {
    super(GroupRepo, {
      findByName: {
        open: false,
        list: [],
      },
      count: {
        open: false,
        list: [],
      },
    });
  }

  async findByName(name: string): Promise<Group | FSGroup> {
    return await this.queueable<Group | FSGroup>(
      'findByName',
      'free_one_by_one',
      async () => {
        await this.checkCountLatch();
        return this.cache.find((e) => e.name === name);
      },
    );
  }

  async count(): Promise<number> {
    return await this.queueable<number>(
      'count',
      'first_done_free_all',
      async () => {
        await this.checkCountLatch();
        return this.cache.length;
      },
    );
  }
}
