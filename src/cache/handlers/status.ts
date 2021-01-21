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
    super(StatusRepo, []);
  }
  
  async findByName(name: string): Promise<FSStatus | Status> {
    await this.checkCountLatch();
    return this.cache.find((e) => e.name === name);
  }
}
