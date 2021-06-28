import { FSApiKeyRepository } from './fs-key';
import { MongoApiKeyRepository } from './key';

export const ApiKeyRepo =
  process.env.DB_USE_FS === 'true'
    ? new FSApiKeyRepository()
    : new MongoApiKeyRepository();
