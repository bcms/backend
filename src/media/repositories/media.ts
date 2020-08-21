import {
  MongoDBRepositoryPrototype,
  Logger,
  MongoDBRepository,
} from '@becomes/purple-cheetah';
import { IMedia, Media } from '../models';
import { Model } from 'mongoose';

@MongoDBRepository({
  entity: {
    schema: Media.schema,
  },
  name: `${process.env.DB_PRFX}_media`,
})
export class MongoMediaRepository
  implements MongoDBRepositoryPrototype<Media, IMedia> {
  repo: Model<IMedia, {}>;
  logger: Logger;

  findAll: () => Promise<Media[]>;
  findAllById: (ids: string[]) => Promise<Media[]>;
  findAllBy: <Q>(query: Q) => Promise<Media[]>;
  findById: (id: string) => Promise<Media>;
  findBy: <Q>(query: Q) => Promise<Media>;
  add: (e: Media) => Promise<boolean>;
  update: (e: Media) => Promise<boolean>;
  deleteById: (id: string) => Promise<boolean>;
  deleteAllById: (ids: string[]) => Promise<number | boolean>;

  async findAllByIsInRoot(isInRoot: boolean): Promise<Media[]> {
    return await this.repo.find({ isInRoot });
  }

  async findAllByPath(path: string): Promise<Media[]> {
    return await this.repo.find({ path });
  }

  async findByPath(path: string): Promise<Media | null> {
    return await this.repo.findOne({ path });
  }

  async findByNameAndPath(name: string, path: string): Promise<Media | null> {
    return await this.repo.findOne({ name, path });
  }

  async count(): Promise<number> {
    return await this.repo.find().countDocuments();
  }
}
