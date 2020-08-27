import { CacheHandler } from '../handler';
import {
  FSEntry,
  Entry,
  IEntry,
  EntryRepo,
  FSEntryRepository,
  MongoEntryRepository,
} from '../../entry';

export class EntryCacheHandler extends CacheHandler<
  FSEntry,
  Entry,
  IEntry,
  FSEntryRepository,
  MongoEntryRepository
> {
  constructor() {
    super(EntryRepo, ['count', 'findAllByTemplateId', 'deleteAllByTemplateId']);
  }

  async findAllByTemplateId(
    templateId: string,
  ): Promise<Array<Entry | FSEntry>> {
    return (await this.queueable.exec(
      'findAllByTemplateId',
      'free_one_by_one',
      async () => {
        await this.checkCountLatch();
        return this.cache.filter((e) => e.templateId === templateId);
      },
    )) as Array<Entry | FSEntry>;
  }

  async count(): Promise<number> {
    await this.queueable.exec('count', 'first_done_free_all', async () => {
      await this.checkCountLatch();
      return true;
    });
    return this.cache.length;
  }

  async countByTemplateId(templateId: string): Promise<number> {
    return await this.repo.countByTemplateId(templateId);
  }

  async deleteAllByTemplateId(templateId: string) {
    await this.queueable.exec('count', 'first_done_free_all', async () => {
      this.cache = this.cache.filter((e) => e.templateId !== templateId);
      await this.repo.deleteAllByTemplateId(templateId);
      return true;
    });
  }
}
