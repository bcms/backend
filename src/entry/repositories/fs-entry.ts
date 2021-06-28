import {
  FSDBRepositoryPrototype,
  Model,
  Logger,
  FSDBRepository,
} from '@becomes/purple-cheetah';
import { FSEntry, EntrySchema } from '../models';

@FSDBRepository({
  schema: EntrySchema,
  collectionName: `${process.env.DB_PRFX}_entries`,
})
export class FSEntryRepository implements FSDBRepositoryPrototype<FSEntry> {
  repo: Model<FSEntry>;
  logger: Logger;

  findAll: () => Promise<FSEntry[]>;
  findAllBy: (query: (e: FSEntry) => boolean) => Promise<FSEntry[]>;
  findAllById: (ids: string[]) => Promise<FSEntry[]>;
  findBy: (query: (e: FSEntry) => boolean) => Promise<FSEntry>;
  findById: (id: string) => Promise<FSEntry>;
  add: (e: FSEntry) => Promise<void>;
  addMany: (e: FSEntry[]) => Promise<void>;
  update: (e: FSEntry) => Promise<boolean>;
  deleteById: (id: string) => Promise<boolean>;
  deleteAllById: (ids: string[]) => Promise<number | boolean>;
  deleteOne: (query: (e: FSEntry) => boolean) => Promise<void>;
  deleteMany: (query: (e: FSEntry) => boolean) => Promise<void>;
  count: () => Promise<number>;

  async findAllByStatus(status: string): Promise<FSEntry[]> {
    return this.repo.find((e) => e.status === status);
  }
  async findAllByTemplateId(templateId: string) {
    return this.repo.find((e) => e.templateId === templateId);
  }
  async clearAllStatuses(currentStatus: string) {
    this.repo.updateMany(
      (e) => e.status === currentStatus,
      (e) => {
        e.status = '';
        return e;
      },
    );
  }
  async deleteAllByTemplateId(templateId: string) {
    this.repo.deleteMany((e) => e.templateId === templateId);
  }
  async countByTemplateId(templateId: string): Promise<number> {
    return this.repo.find((e) => e.templateId === templateId).length;
  }
}
