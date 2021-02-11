import { CacheHandler } from '../handler';
import {
  FSTemplate,
  Template,
  ITemplate,
  TemplateRepo,
  FSTemplateRepository,
  MongoTemplateRepository,
} from '../../template';
import { Logger } from '@becomes/purple-cheetah';

export class TemplateCacheHandler extends CacheHandler<FSTemplate,
  Template,
  ITemplate,
  FSTemplateRepository,
  MongoTemplateRepository> {
  constructor() {
    super(
      TemplateRepo,
      ['findByName', 'count'],
      new Logger('TemplateCacheHandler'),
    );
  }

  async findByName(name: string): Promise<Template | FSTemplate> {
    await this.checkCountLatch();
    return this.cache.find((e) => e.name === name);
  }

  async count(): Promise<number> {
    await this.queueable.exec('count', 'first_done_free_all', async () => {
      await this.checkCountLatch();
      return true;
    });
    return this.cache.length;
  }
}
