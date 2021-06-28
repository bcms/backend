import { CacheHandler } from '../handler';
import {
  FSApiKey,
  ApiKey,
  IApiKey,
  ApiKeyRepo,
  FSApiKeyRepository,
  MongoApiKeyRepository,
} from '../../_api';
import { Logger } from '@becomes/purple-cheetah';

export class ApiKeyCacheHandler extends CacheHandler<
  FSApiKey,
  ApiKey,
  IApiKey,
  FSApiKeyRepository,
  MongoApiKeyRepository
> {
  constructor() {
    super(ApiKeyRepo, ['count'], new Logger('ApiKeyCacheHandler'));
  }

  async count(): Promise<number> {
    await this.queueable.exec('count', 'first_done_free_all', async () => {
      await this.checkCountLatch();
      return true;
    });
    return this.cache.length;
  }
}
