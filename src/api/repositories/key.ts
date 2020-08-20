import {
  MongoDBRepositoryPrototype,
  Logger,
  MongoDBRepository,
} from '@becomes/purple-cheetah';
import { ApiKey, IApiKey } from '../models';
import { Model } from 'mongoose';

@MongoDBRepository({
  entity: {
    schema: ApiKey.schema,
  },
  name: `${process.env.DB_PRFX}_api_keys`,
})
export class MongoApiKeyRepository
  implements MongoDBRepositoryPrototype<ApiKey, IApiKey> {
  repo: Model<IApiKey, {}>;
  logger: Logger;

  findAll: () => Promise<ApiKey[]>;
  findAllById: (ids: string[]) => Promise<ApiKey[]>;
  findAllBy: <Q>(query: Q) => Promise<ApiKey[]>;
  findById: (id: string) => Promise<ApiKey>;
  findBy: (query: any) => Promise<ApiKey>;
  add: (e: ApiKey) => Promise<boolean>;
  update: (e: ApiKey) => Promise<boolean>;
  deleteById: (id: string) => Promise<boolean>;
  deleteAllById: (ids: string[]) => Promise<number | boolean>;

  async count(): Promise<number> {
    return await this.repo.find().countDocuments();
  }
}
