import {
  FSDBRepositoryPrototype,
  Model,
  Logger,
  FSDBRepository,
} from '@becomes/purple-cheetah';
import { FSApiKey, ApiKeySchema } from '../models';

@FSDBRepository({
  schema: ApiKeySchema,
  collectionName: `${process.env.DB_PRFX}_api_keys`,
})
export class FSApiKeyRepository implements FSDBRepositoryPrototype<FSApiKey> {
  repo: Model<FSApiKey>;
  logger: Logger;

  findAll: () => Promise<FSApiKey[]>;
  findAllBy: (query: (e: FSApiKey) => boolean) => Promise<FSApiKey[]>;
  findAllById: (ids: string[]) => Promise<FSApiKey[]>;
  findBy: (query: (e: FSApiKey) => boolean) => Promise<FSApiKey>;
  findById: (id: string) => Promise<FSApiKey>;
  add: (e: FSApiKey) => Promise<void>;
  addMany: (e: FSApiKey[]) => Promise<void>;
  update: (e: FSApiKey) => Promise<boolean>;
  deleteById: (id: string) => Promise<boolean>;
  deleteAllById: (ids: string[]) => Promise<number | boolean>;
  deleteOne: (query: (e: FSApiKey) => boolean) => Promise<void>;
  deleteMany: (query: (e: FSApiKey) => boolean) => Promise<void>;
  count: () => Promise<number>;
}
