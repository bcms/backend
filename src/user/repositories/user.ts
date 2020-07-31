import {
  MongoDBRepositoryPrototype,
  Logger,
  MongoDBRepository,
} from '@becomes/purple-cheetah';
import { User, IUser } from '../models/user';
import { Model } from 'mongoose';

@MongoDBRepository({
  entity: {
    schema: User.schema,
  },
  name: `${process.env.DB_PRFX}_users`,
})
export class MongoUserRepository
  implements MongoDBRepositoryPrototype<User, IUser> {
  repo: Model<IUser, {}>;
  logger: Logger;

  findAll: () => Promise<User[]>;
  findAllById: (ids: string[]) => Promise<User[]>;
  findAllBy: <Q>(query: Q) => Promise<User[]>;
  findById: (id: string) => Promise<User>;
  findBy: (query: any) => Promise<User>;
  add: (e: User) => Promise<boolean>;
  update: (e: User) => Promise<boolean>;
  deleteById: (id: string) => Promise<boolean>;
  deleteAllById: (ids: string[]) => Promise<number | boolean>;

  async findByEmail(email: string): Promise<User | null> {
    return await this.repo.findOne({ email });
  }

  async findByRefreshToken(rt: string): Promise<User | null> {
    return await this.repo.findOne({ 'refreshTokens.value': rt });
  }

  async count(): Promise<number> {
    return await this.repo.find().countDocuments();
  }
}
