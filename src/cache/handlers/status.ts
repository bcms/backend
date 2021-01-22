import {
  FSStatus,
  FSStatusRepository,
  IStatus,
  Status,
  StatusRepo,
  StatusRepository,
} from '../../status';
import { CacheHandler } from '../handler';

export class StatusCacheHandler extends CacheHandler<
  FSStatus,
  Status,
  IStatus,
  FSStatusRepository,
  StatusRepository
> {
  constructor() {
    super(StatusRepo, ['count']);
  }
  
  async findByName(name: string): Promise<FSStatus | Status> {
    await this.checkCountLatch();
    return this.cache.find((e) => e.name === name);
  }

  async count(): Promise<number> {
    await this.queueable.exec('count', 'first_done_free_all', async () => {
      await this.checkCountLatch();
      return true;
    });
    return this.cache.length;
  }
}
