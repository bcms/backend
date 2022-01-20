import { CacheHandler } from '../handler';
import {
  FSLanguage,
  Language,
  ILanguage,
  LanguageRepo,
  FSLanguageRepository,
  MongoLanguageRepository,
} from '../../language';
import { Logger } from '@becomes/purple-cheetah';

export class LanguageCacheHandler extends CacheHandler<FSLanguage,
  Language,
  ILanguage,
  FSLanguageRepository,
  MongoLanguageRepository> {
  constructor() {
    super(
      LanguageRepo,
      ['findByCode', 'findDefault', 'count'],
      new Logger('LanguageCacheHandler'),
    );
  }

  async findByCode(code: string): Promise<Language | FSLanguage> {
    await this.checkCountLatch();
    return this.cache.find((e) => e.code === code);
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