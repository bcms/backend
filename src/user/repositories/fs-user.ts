import {
  FSDBRepositoryPrototype,
  Model,
  Logger,
  FSDBRepository,
} from '@becomes/purple-cheetah';
import { FSUser, UserSchema } from '../models';

@FSDBRepository({
  collectionName: `${process.env.DB_PRFX}_users`,
  schema: UserSchema,
})
export class FSUserRepository implements FSDBRepositoryPrototype<FSUser> {
  repo: Model<FSUser>;
  logger: Logger;

  findAll: () => Promise<FSUser[]>;
  findAllBy: (query: (e: FSUser) => boolean) => Promise<FSUser[]>;
  findAllById: (ids: string[]) => Promise<FSUser[]>;
  findBy: (query: (e: FSUser) => boolean) => Promise<FSUser>;
  findById: (id: string) => Promise<FSUser>;
  add: (e: FSUser) => Promise<void>;
  addMany: (e: FSUser[]) => Promise<void>;
  update: (e: FSUser) => Promise<boolean>;
  deleteById: (id: string) => Promise<boolean>;
  deleteAllById: (ids: string[]) => Promise<number | boolean>;
  deleteOne: (query: (e: FSUser) => boolean) => Promise<void>;
  deleteMany: (query: (e: FSUser) => boolean) => Promise<void>;

  async findByEmail(email: string): Promise<FSUser | null> {
    return this.repo.findOne((e) => e.email === email);
  }

  async findByRefreshToken(rt: string): Promise<FSUser | null> {
    return this.repo.findOne((e) =>
      e.refreshTokens.find((t) => t.value === rt) ? true : false,
    );
  }

  async count(): Promise<number> {
    return (await this.repo.find()).length;
  }
}
