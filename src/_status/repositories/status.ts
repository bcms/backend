import {
  Logger,
  MongoDBRepository,
  MongoDBRepositoryPrototype,
} from '@becomes/purple-cheetah';
import { Model } from 'mongoose';
import { IStatus, Status } from '../models';

@MongoDBRepository({
  entity: {
    schema: Status.schema,
  },
  name: `${process.env.DB_PRFX}_statuses`,
})
export class StatusRepository
  implements MongoDBRepositoryPrototype<Status, IStatus> {
  repo: Model<IStatus>;
  logger: Logger;
  findAll: () => Promise<Status[]>;
  findAllById: (ids: string[]) => Promise<Status[]>;
  findAllBy: <Q>(query: Q) => Promise<Status[]>;
  findById: (id: string) => Promise<Status>;
  findBy: <Q>(query: Q) => Promise<Status>;
  add: (e: Status) => Promise<boolean>;
  update: (e: Status) => Promise<boolean>;
  deleteById: (id: string) => Promise<boolean>;
  deleteAllById: (ids: string[]) => Promise<number | boolean>;

  async findByName(name: string): Promise<Status> {
    return await this.repo.findOne({ name });
  }

  async count(): Promise<number> {
    return await this.repo.countDocuments();
  }
}
