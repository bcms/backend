import { CacheHandler } from '../handler';
import {
  FSApiKey,
  ApiKey,
  IApiKey,
  ApiKeyRepo,
  FSApiKeyRepository,
  MongoApiKeyRepository,
} from '../../api';

export class ApiKeyCacheHandler extends CacheHandler<
  FSApiKey,
  ApiKey,
  IApiKey,
  FSApiKeyRepository,
  MongoApiKeyRepository
> {
  constructor() {
    super(ApiKeyRepo, ['count']);
  }

  async count(): Promise<number> {
    await this.queueable.exec('count', 'first_done_free_all', async () => {
      await this.checkCountLatch();
      return true;
    });
    return this.cache.length;
  }
}
