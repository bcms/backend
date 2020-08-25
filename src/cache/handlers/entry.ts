import { CacheHandler } from '../handler';
import { FSEntry, Entry, IEntry, EntryRepo } from '../../entry';

export class EntryCacheHandler extends CacheHandler<FSEntry, Entry, IEntry> {
  constructor() {
    super(EntryRepo, ['count', 'findAllByTemplateId']);
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
}
