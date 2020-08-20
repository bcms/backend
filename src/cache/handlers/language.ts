import { CacheHandler } from '../handler';
import { FSLanguage, Language, ILanguage, LanguageRepo } from '../../language';

export class LanguageCacheHandler extends CacheHandler<
  FSLanguage,
  Language,
  ILanguage
> {
  constructor() {
    super(LanguageRepo, ['findByCode', 'findDefault', 'count']);
  }

  async findByCode(code: string): Promise<Language | FSLanguage> {
    return (await this.queueable.exec(
      'findByCode',
      'free_one_by_one',
      async () => {
        await this.checkCountLatch();
        return this.cache.find((e) => e.code === code);
      },
    )) as Language | FSLanguage;
  }

  async findDefault(): Promise<Language | FSLanguage> {
    return (await this.queueable.exec(
      'findDefault',
      'first_done_free_all',
      async () => {
        await this.checkCountLatch();
        return this.cache.find((e) => e.def === true);
      },
    )) as Language | FSLanguage;
  }

  async count(): Promise<number> {
    await this.queueable.exec('count', 'first_done_free_all', async () => {
      await this.checkCountLatch();
      return true;
    });
    return this.cache.length;
  }
}
